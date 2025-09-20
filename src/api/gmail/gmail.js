const { google } = require("googleapis");
const debug = require("debug")("tkidman:rally-round:gmail");

/**
 * Creates a Gmail API client using OAuth2 authentication
 * @returns {Object} Gmail API client instance
 */
const createGmailClient = () => {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Gmail API credentials not found. Please set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REFRESH_TOKEN environment variables."
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "http://localhost"
  );

  const tokens = {
    refresh_token: refreshToken
  };
  oauth2Client.setCredentials(tokens);

  const gmail = google.gmail({
    version: "v1",
    auth: oauth2Client
  });

  return gmail;
};

/**
 * Gets the list of messages from Gmail
 * @param {Object} options - Query options
 * @param {string} options.query - Gmail search query (e.g., "is:unread", "from:example@gmail.com")
 * @param {number} options.maxResults - Maximum number of messages to return (default: 10)
 * @param {string} options.labelIds - Comma-separated list of label IDs to search in
 * @returns {Promise<Array>} Array of message objects
 */
const getMessages = async (options = {}) => {
  const gmail = createGmailClient();
  const { query = "is:unread", maxResults = 10, labelIds = "INBOX" } = options;

  try {
    debug(`Fetching messages with query: ${query}`);

    const response = await gmail.users.messages.list({
      userId: "me",
      q: query,
      maxResults: maxResults,
      labelIds: labelIds.split(",")
    });

    const messages = response.data.messages || [];
    debug(`Found ${messages.length} messages`);

    return messages;
  } catch (error) {
    debug(`Error fetching messages: ${error.message}`);
    throw error;
  }
};

/**
 * Gets detailed information about a specific message
 * @param {string} messageId - The ID of the message to retrieve
 * @param {string} format - The format to return the message in ('full', 'metadata', 'minimal', 'raw')
 * @returns {Promise<Object>} Message details
 */
const getMessage = async (messageId, format = "full") => {
  const gmail = createGmailClient();

  try {
    debug(`Fetching message details for ID: ${messageId}`);

    const response = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: format
    });

    return response.data;
  } catch (error) {
    debug(`Error fetching message ${messageId}: ${error.message}`);
    throw error;
  }
};

/**
 * Gets new unread messages from Gmail
 * @param {Object} options - Query options
 * @param {number} options.maxResults - Maximum number of messages to return (default: 10)
 * @param {string} options.from - Filter by sender email address
 * @param {string} options.subject - Filter by subject containing text
 * @param {Date} options.since - Only get messages since this date
 * @returns {Promise<Array>} Array of unread message objects with full details
 */
const getNewMessages = async (options = {}) => {
  const { maxResults = 10, from, subject, since } = options;

  // Build Gmail search query
  let query = "is:unread";

  if (from) {
    query += ` from:${from}`;
  }

  if (subject) {
    query += ` subject:${subject}`;
  }

  if (since) {
    const sinceTimestamp = Math.floor(since.getTime() / 1000);
    query += ` after:${sinceTimestamp}`;
  }

  debug(`Searching for new messages with query: ${query}`);

  // Get message list
  const messages = await getMessages({
    query,
    maxResults
  });

  // Get full details for each message
  const messageDetails = await Promise.all(
    messages.map(message => getMessage(message.id))
  );

  return messageDetails;
};

/**
 * Marks a message as read
 * @param {string} messageId - The ID of the message to mark as read
 * @returns {Promise<Object>} Updated message object
 */
const markAsRead = async messageId => {
  const gmail = createGmailClient();

  try {
    debug(`Marking message ${messageId} as read`);

    const response = await gmail.users.messages.modify({
      userId: "me",
      id: messageId,
      resource: {
        removeLabelIds: ["UNREAD"]
      }
    });

    return response.data;
  } catch (error) {
    debug(`Error marking message ${messageId} as read: ${error.message}`);
    throw error;
  }
};

/**
 * Marks a message as unread
 * @param {string} messageId - The ID of the message to mark as unread
 * @returns {Promise<Object>} Updated message object
 */
const markAsUnread = async messageId => {
  const gmail = createGmailClient();

  try {
    debug(`Marking message ${messageId} as unread`);

    const response = await gmail.users.messages.modify({
      userId: "me",
      id: messageId,
      resource: {
        addLabelIds: ["UNREAD"]
      }
    });

    return response.data;
  } catch (error) {
    debug(`Error marking message ${messageId} as unread: ${error.message}`);
    throw error;
  }
};

/**
 * Extracts text content from a Gmail message
 * @param {Object} message - Gmail message object
 * @returns {Object} Object containing subject, from, date, and text content
 */
const extractMessageContent = message => {
  const headers = message.payload.headers;

  const getHeader = name => {
    const header = headers.find(
      h => h.name.toLowerCase() === name.toLowerCase()
    );
    return header ? header.value : null;
  };

  const subject = getHeader("Subject");
  const from = getHeader("From");
  const date = getHeader("Date");

  // Extract text content from message parts
  let textContent = "";
  let htmlContent = "";

  const extractTextFromPart = part => {
    if (part.body && part.body.data) {
      const content = Buffer.from(part.body.data, "base64").toString();
      if (part.mimeType === "text/plain") {
        textContent += content;
      } else if (part.mimeType === "text/html") {
        htmlContent += content;
      }
    }

    if (part.parts) {
      part.parts.forEach(extractTextFromPart);
    }
  };

  if (message.payload.parts) {
    message.payload.parts.forEach(extractTextFromPart);
  } else if (message.payload.body && message.payload.body.data) {
    const content = Buffer.from(message.payload.body.data, "base64").toString();
    if (message.payload.mimeType === "text/plain") {
      textContent = content;
    } else if (message.payload.mimeType === "text/html") {
      htmlContent = content;
    }
  }

  return {
    id: message.id,
    subject,
    from,
    date,
    textContent: textContent.trim(),
    htmlContent: htmlContent.trim(),
    snippet: message.snippet
  };
};

/**
 * Gets unread message count
 * @param {string} labelIds - Comma-separated list of label IDs to check (default: "INBOX")
 * @returns {Promise<number>} Number of unread messages
 */
const getUnreadCount = async (labelIds = "INBOX") => {
  const gmail = createGmailClient();

  try {
    const response = await gmail.users.messages.list({
      userId: "me",
      q: "is:unread",
      labelIds: labelIds.split(","),
      maxResults: 1
    });

    // Get the total count from the nextPageToken or estimate from results
    const messages = response.data.messages || [];
    const count = messages.length;

    debug(`Found ${count} unread messages`);
    return count;
  } catch (error) {
    debug(`Error getting unread count: ${error.message}`);
    throw error;
  }
};

module.exports = {
  createGmailClient,
  getMessages,
  getMessage,
  getNewMessages,
  markAsRead,
  markAsUnread,
  extractMessageContent,
  getUnreadCount
};
