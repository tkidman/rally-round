# Gmail API Integration

This module provides a simple interface to interact with the Gmail API to check for new messages, retrieve message details, and manage message status.

## Setup

### 1. Enable Gmail API

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click on it and press "Enable"

### 2. Create OAuth2 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application" as the application type
4. Add `http://localhost` to the "Authorized redirect URIs"
5. Download the credentials JSON file

### 3. Get Refresh Token

You'll need to obtain a refresh token for your Gmail account. You can use the Google OAuth2 Playground or create a simple script:

```javascript
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  'YOUR_CLIENT_ID',
  'YOUR_CLIENT_SECRET',
  'http://localhost'
);

// Generate the URL for OAuth2 consent
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/gmail.readonly']
});

console.log('Visit this URL to authorize the application:', authUrl);
```

After authorization, you'll get a refresh token that you can use.

### 4. Set Environment Variables

Add the following environment variables to your `.env` file:

```bash
GMAIL_CLIENT_ID=your_client_id_here
GMAIL_CLIENT_SECRET=your_client_secret_here
GMAIL_REFRESH_TOKEN=your_refresh_token_here
```

## Usage

### Basic Usage

```javascript
const { getNewMessages, getUnreadCount } = require('./gmail');

// Check unread message count
const count = await getUnreadCount();
console.log(`You have ${count} unread messages`);

// Get new messages
const messages = await getNewMessages();
console.log(`Found ${messages.length} new messages`);
```

### Advanced Usage

```javascript
const { 
  getNewMessages, 
  extractMessageContent, 
  markAsRead 
} = require('./gmail');

// Get messages from a specific sender
const messages = await getNewMessages({
  from: 'noreply@example.com',
  maxResults: 10
});

// Process each message
for (const message of messages) {
  const content = extractMessageContent(message);
  console.log(`Subject: ${content.subject}`);
  console.log(`From: ${content.from}`);
  console.log(`Content: ${content.textContent}`);
  
  // Mark as read after processing
  await markAsRead(message.id);
}
```

### Filtering Messages

You can filter messages using various criteria:

```javascript
// Messages from specific sender
const messages = await getNewMessages({
  from: 'important@company.com'
});

// Messages with specific subject
const messages = await getNewMessages({
  subject: 'urgent'
});

// Messages since a specific date
const messages = await getNewMessages({
  since: new Date('2024-01-01')
});

// Combine filters
const messages = await getNewMessages({
  from: 'alerts@system.com',
  subject: 'error',
  since: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
  maxResults: 5
});
```

## API Reference

### Functions

#### `getNewMessages(options)`
Gets new unread messages with full details.

**Parameters:**
- `options.maxResults` (number): Maximum number of messages to return (default: 10)
- `options.from` (string): Filter by sender email address
- `options.subject` (string): Filter by subject containing text
- `options.since` (Date): Only get messages since this date

**Returns:** Promise<Array> - Array of message objects with full details

#### `getUnreadCount(labelIds)`
Gets the count of unread messages.

**Parameters:**
- `labelIds` (string): Comma-separated list of label IDs to check (default: "INBOX")

**Returns:** Promise<number> - Number of unread messages

#### `extractMessageContent(message)`
Extracts readable content from a Gmail message object.

**Parameters:**
- `message` (Object): Gmail message object

**Returns:** Object containing:
- `id`: Message ID
- `subject`: Message subject
- `from`: Sender email
- `date`: Message date
- `textContent`: Plain text content
- `htmlContent`: HTML content
- `snippet`: Message snippet

#### `markAsRead(messageId)`
Marks a message as read.

**Parameters:**
- `messageId` (string): The ID of the message to mark as read

**Returns:** Promise<Object> - Updated message object

#### `markAsUnread(messageId)`
Marks a message as unread.

**Parameters:**
- `messageId` (string): The ID of the message to mark as unread

**Returns:** Promise<Object> - Updated message object

#### `getMessages(options)`
Gets a list of messages based on search criteria.

**Parameters:**
- `options.query` (string): Gmail search query (default: "is:unread")
- `options.maxResults` (number): Maximum number of messages (default: 10)
- `options.labelIds` (string): Comma-separated list of label IDs (default: "INBOX")

**Returns:** Promise<Array> - Array of message objects

#### `getMessage(messageId, format)`
Gets detailed information about a specific message.

**Parameters:**
- `messageId` (string): The ID of the message to retrieve
- `format` (string): The format to return the message in ('full', 'metadata', 'minimal', 'raw') (default: "full")

**Returns:** Promise<Object> - Message details

## Gmail Search Query Syntax

The Gmail API supports powerful search queries. Here are some common examples:

- `is:unread` - Unread messages
- `is:read` - Read messages
- `from:example@gmail.com` - Messages from specific sender
- `to:example@gmail.com` - Messages to specific recipient
- `subject:urgent` - Messages with "urgent" in subject
- `has:attachment` - Messages with attachments
- `after:2024/01/01` - Messages after specific date
- `before:2024/12/31` - Messages before specific date
- `label:important` - Messages with specific label
- `is:starred` - Starred messages

You can combine multiple criteria:
- `is:unread from:boss@company.com subject:meeting` - Unread messages from boss about meetings

## Error Handling

All functions throw errors that should be caught and handled:

```javascript
try {
  const messages = await getNewMessages();
  console.log(`Found ${messages.length} messages`);
} catch (error) {
  console.error('Error fetching messages:', error.message);
  // Handle error appropriately
}
```

Common errors:
- **Authentication errors**: Check your credentials and refresh token
- **Rate limit errors**: Gmail API has rate limits, implement retry logic
- **Permission errors**: Ensure your OAuth2 scope includes required permissions

## Testing

Run the tests with:

```bash
npm test src/api/gmail/gmail.test.js
```

Run the example script:

```bash
node src/api/gmail/example.js
```

## Dependencies

This module requires the following packages (already included in the project):
- `googleapis` - Google APIs client library
- `debug` - Debug logging utility

## Security Notes

- Never commit your OAuth2 credentials to version control
- Use environment variables for all sensitive data
- Regularly rotate your refresh tokens
- Use the minimum required OAuth2 scopes
- Consider implementing token refresh logic for production use
