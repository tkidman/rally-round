const {
  getNewMessages,
  getUnreadCount,
  extractMessageContent,
  markAsRead,
  markAsUnread
} = require("./gmail");

/**
 * Example usage of the Gmail API functions
 * This file demonstrates how to use the Gmail API to check for new messages
 */

async function checkForNewMessages() {
  try {
    console.log("Checking for new messages...");

    // Get unread message count
    const unreadCount = await getUnreadCount();
    console.log(`You have ${unreadCount} unread messages`);

    if (unreadCount === 0) {
      console.log("No new messages!");
      return;
    }

    // Get new messages with full details
    const newMessages = await getNewMessages({
      maxResults: 5 // Limit to 5 most recent unread messages
    });

    console.log(`\nFound ${newMessages.length} new messages:`);

    newMessages.forEach((message, index) => {
      const content = extractMessageContent(message);
      console.log(`\n${index + 1}. Subject: ${content.subject}`);
      console.log(`   From: ${content.from}`);
      console.log(`   Date: ${content.date}`);
      console.log(`   Snippet: ${content.snippet}`);
      console.log(`   Message ID: ${content.id}`);
    });

    return newMessages;
  } catch (error) {
    console.error("Error checking for new messages:", error.message);
    throw error;
  }
}

async function checkMessagesFromSpecificSender() {
  try {
    console.log("Checking for messages from specific sender...");

    // Get messages from a specific sender
    const messages = await getNewMessages({
      from: "noreply@example.com",
      maxResults: 10
    });

    console.log(`Found ${messages.length} messages from noreply@example.com`);

    messages.forEach((message, index) => {
      const content = extractMessageContent(message);
      console.log(`\n${index + 1}. Subject: ${content.subject}`);
      console.log(`   Date: ${content.date}`);
      console.log(`   Snippet: ${content.snippet}`);
    });

    return messages;
  } catch (error) {
    console.error(
      "Error checking messages from specific sender:",
      error.message
    );
    throw error;
  }
}

async function checkMessagesWithSubject() {
  try {
    console.log("Checking for messages with specific subject...");

    // Get messages with a specific subject
    const messages = await getNewMessages({
      subject: "urgent",
      maxResults: 10
    });

    console.log(`Found ${messages.length} messages with 'urgent' in subject`);

    messages.forEach((message, index) => {
      const content = extractMessageContent(message);
      console.log(`\n${index + 1}. Subject: ${content.subject}`);
      console.log(`   From: ${content.from}`);
      console.log(`   Date: ${content.date}`);
    });

    return messages;
  } catch (error) {
    console.error("Error checking messages with subject:", error.message);
    throw error;
  }
}

async function checkMessagesSinceDate() {
  try {
    console.log("Checking for messages since a specific date...");

    // Get messages since yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const messages = await getNewMessages({
      since: yesterday,
      maxResults: 10
    });

    console.log(`Found ${messages.length} messages since yesterday`);

    messages.forEach((message, index) => {
      const content = extractMessageContent(message);
      console.log(`\n${index + 1}. Subject: ${content.subject}`);
      console.log(`   From: ${content.from}`);
      console.log(`   Date: ${content.date}`);
    });

    return messages;
  } catch (error) {
    console.error("Error checking messages since date:", error.message);
    throw error;
  }
}

async function markMessagesAsRead() {
  try {
    console.log("Marking messages as read...");

    // Get some unread messages
    const messages = await getNewMessages({ maxResults: 3 });

    if (messages.length === 0) {
      console.log("No unread messages to mark as read");
      return;
    }

    // Mark each message as read
    for (const message of messages) {
      const content = extractMessageContent(message);
      console.log(`Marking message "${content.subject}" as read...`);
      await markAsRead(message.id);
    }

    console.log(`Marked ${messages.length} messages as read`);
  } catch (error) {
    console.error("Error marking messages as read:", error.message);
    throw error;
  }
}

async function markMessagesAsUnread() {
  try {
    console.log("Marking messages as unread...");

    // Get some messages (this would typically be from a different query)
    const messages = await getNewMessages({ maxResults: 2 });

    if (messages.length === 0) {
      console.log("No messages to mark as unread");
      return;
    }

    // Mark each message as unread
    for (const message of messages) {
      const content = extractMessageContent(message);
      console.log(`Marking message "${content.subject}" as unread...`);
      await markAsUnread(message.id);
    }

    console.log(`Marked ${messages.length} messages as unread`);
  } catch (error) {
    console.error("Error marking messages as unread:", error.message);
    throw error;
  }
}

// Main function to run all examples
async function runExamples() {
  console.log("=== Gmail API Examples ===\n");

  try {
    // Check for new messages
    await checkForNewMessages();

    console.log("\n" + "=".repeat(50) + "\n");

    // Check messages from specific sender
    await checkMessagesFromSpecificSender();

    console.log("\n" + "=".repeat(50) + "\n");

    // Check messages with specific subject
    await checkMessagesWithSubject();

    console.log("\n" + "=".repeat(50) + "\n");

    // Check messages since specific date
    await checkMessagesSinceDate();

    console.log("\n" + "=".repeat(50) + "\n");

    // Mark messages as read (uncomment to test)
    // await markMessagesAsRead();

    // Mark messages as unread (uncomment to test)
    // await markMessagesAsUnread();
  } catch (error) {
    console.error("Error running examples:", error.message);
    process.exit(1);
  }
}

// Export functions for use in other modules
module.exports = {
  checkForNewMessages,
  checkMessagesFromSpecificSender,
  checkMessagesWithSubject,
  checkMessagesSinceDate,
  markMessagesAsRead,
  markMessagesAsUnread,
  runExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples();
}
