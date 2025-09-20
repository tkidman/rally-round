# Gmail 2FA Integration

This commit adds Gmail API integration with automatic 2FA handling for Racenet authentication.

## New Features

### Gmail API Integration (`src/api/gmail/`)

- **`gmail.js`** - Core Gmail API functions for checking messages, extracting content, and managing message status
- **`gmail.test.js`** - Comprehensive test suite for Gmail API functionality
- **`example.js`** - Usage examples and demonstrations
- **`README.md`** - Complete setup and usage documentation

### 2FA Automation (`src/api/wrc/`)

- **`gmail2fa.js`** - Handles automatic 2FA process by retrieving security codes from Gmail
- **Enhanced `getCreds.js`** - Integrated 2FA handling into existing Racenet authentication flow

## Key Capabilities

### Gmail API Functions

- `getNewMessages()` - Retrieve unread messages with filtering options
- `getUnreadCount()` - Count unread messages
- `extractMessageContent()` - Extract readable content from Gmail messages
- `markAsRead()` / `markAsUnread()` - Manage message status
- `waitForSecurityCode()` - Wait for and extract EA security codes from Gmail

### 2FA Automation

- Automatically detects when 2FA is required on EA login
- Clicks "Send Code" button when present
- Monitors Gmail for security code emails with subject "Your EA Security Code is: xxxxxx"
- Extracts 6-digit security code automatically
- Enters code and submits form
- Handles both regular and 2FA-protected logins seamlessly

## Setup Required

### Environment Variables

Add to `.env`:

```bash
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
GMAIL_REFRESH_TOKEN=your_gmail_refresh_token
```

### Gmail API Setup

1. Enable Gmail API in Google Cloud Console
2. Create OAuth2 credentials
3. Get refresh token using provided scripts
4. Set environment variables

## Usage

The integration is automatic - no code changes needed in existing applications. When Racenet requires 2FA, the system will:

1. Detect the 2FA requirement
2. Click "Send Code" button
3. Retrieve security code from Gmail
4. Enter code and submit
5. Complete authentication process

## Files Added

- `src/api/gmail/gmail.js` - Core Gmail API
- `src/api/gmail/gmail.test.js` - Tests
- `src/api/gmail/example.js` - Examples
- `src/api/gmail/README.md` - Documentation
- `src/api/wrc/gmail2fa.js` - 2FA automation

## Files Modified

- `src/api/wrc/getCreds.js` - Enhanced with 2FA support

## Files Removed

- Temporary test and debug files
- Token generation scripts (moved to hidden/)
- Backup files

## Dependencies

- `googleapis` - Google APIs client library (already in package.json)
- `puppeteer` - Browser automation (already in package.json)

The integration maintains backward compatibility while adding seamless 2FA handling for improved reliability.
