const {
  createGmailClient,
  getMessages,
  getMessage,
  getNewMessages,
  markAsRead,
  markAsUnread,
  extractMessageContent,
  getUnreadCount
} = require("./gmail");

// Mock the googleapis module
jest.mock("googleapis", () => ({
  google: {
    auth: {
      OAuth2: jest.fn().mockImplementation(() => ({
        setCredentials: jest.fn()
      }))
    },
    gmail: jest.fn().mockReturnValue({
      users: {
        messages: {
          list: jest.fn(),
          get: jest.fn(),
          modify: jest.fn()
        }
      }
    })
  }
}));

const { google } = require("googleapis");

describe("Gmail API", () => {
  beforeEach(() => {
    // Reset environment variables
    process.env.GMAIL_CLIENT_ID = "test-client-id";
    process.env.GMAIL_CLIENT_SECRET = "test-client-secret";
    process.env.GMAIL_REFRESH_TOKEN = "test-refresh-token";

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe("createGmailClient", () => {
    it("should create a Gmail client with valid credentials", () => {
      const client = createGmailClient();
      expect(client).toBeDefined();
      expect(google.auth.OAuth2).toHaveBeenCalledWith(
        "test-client-id",
        "test-client-secret",
        "http://localhost"
      );
    });

    it("should throw error when credentials are missing", () => {
      delete process.env.GMAIL_CLIENT_ID;

      expect(() => createGmailClient()).toThrow(
        "Gmail API credentials not found. Please set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REFRESH_TOKEN environment variables."
      );
    });
  });

  describe("getMessages", () => {
    it("should fetch messages with default parameters", async () => {
      const mockGmail = {
        users: {
          messages: {
            list: jest.fn().mockResolvedValue({
              data: {
                messages: [{ id: "msg1" }, { id: "msg2" }]
              }
            })
          }
        }
      };

      google.gmail.mockReturnValue(mockGmail);

      const messages = await getMessages();

      expect(messages).toHaveLength(2);
      expect(mockGmail.users.messages.list).toHaveBeenCalledWith({
        userId: "me",
        q: "is:unread",
        maxResults: 10,
        labelIds: ["INBOX"]
      });
    });

    it("should fetch messages with custom parameters", async () => {
      const mockGmail = {
        users: {
          messages: {
            list: jest.fn().mockResolvedValue({
              data: {
                messages: [{ id: "msg1" }]
              }
            })
          }
        }
      };

      google.gmail.mockReturnValue(mockGmail);

      const messages = await getMessages({
        query: "from:test@example.com",
        maxResults: 5,
        labelIds: "SENT,INBOX"
      });

      expect(messages).toHaveLength(1);
      expect(mockGmail.users.messages.list).toHaveBeenCalledWith({
        userId: "me",
        q: "from:test@example.com",
        maxResults: 5,
        labelIds: ["SENT", "INBOX"]
      });
    });
  });

  describe("getMessage", () => {
    it("should fetch a specific message", async () => {
      const mockGmail = {
        users: {
          messages: {
            get: jest.fn().mockResolvedValue({
              data: { id: "msg1", snippet: "Test message" }
            })
          }
        }
      };

      google.gmail.mockReturnValue(mockGmail);

      const message = await getMessage("msg1");

      expect(message).toEqual({ id: "msg1", snippet: "Test message" });
      expect(mockGmail.users.messages.get).toHaveBeenCalledWith({
        userId: "me",
        id: "msg1",
        format: "full"
      });
    });
  });

  describe("getNewMessages", () => {
    it("should get new unread messages with full details", async () => {
      const mockGmail = {
        users: {
          messages: {
            list: jest.fn().mockResolvedValue({
              data: {
                messages: [{ id: "msg1" }, { id: "msg2" }]
              }
            }),
            get: jest
              .fn()
              .mockResolvedValueOnce({
                data: { id: "msg1", snippet: "Message 1" }
              })
              .mockResolvedValueOnce({
                data: { id: "msg2", snippet: "Message 2" }
              })
          }
        }
      };

      google.gmail.mockReturnValue(mockGmail);

      const messages = await getNewMessages();

      expect(messages).toHaveLength(2);
      expect(messages[0]).toEqual({ id: "msg1", snippet: "Message 1" });
      expect(messages[1]).toEqual({ id: "msg2", snippet: "Message 2" });
    });

    it("should build correct query with filters", async () => {
      const mockGmail = {
        users: {
          messages: {
            list: jest.fn().mockResolvedValue({ data: { messages: [] } }),
            get: jest.fn()
          }
        }
      };

      google.gmail.mockReturnValue(mockGmail);

      const since = new Date("2024-01-01");
      await getNewMessages({
        from: "test@example.com",
        subject: "important",
        since: since
      });

      expect(mockGmail.users.messages.list).toHaveBeenCalledWith({
        userId: "me",
        q: "is:unread from:test@example.com subject:important after:1704067200",
        maxResults: 10,
        labelIds: ["INBOX"]
      });
    });
  });

  describe("markAsRead", () => {
    it("should mark a message as read", async () => {
      const mockGmail = {
        users: {
          messages: {
            modify: jest.fn().mockResolvedValue({
              data: { id: "msg1", labelIds: ["INBOX"] }
            })
          }
        }
      };

      google.gmail.mockReturnValue(mockGmail);

      const result = await markAsRead("msg1");

      expect(result).toEqual({ id: "msg1", labelIds: ["INBOX"] });
      expect(mockGmail.users.messages.modify).toHaveBeenCalledWith({
        userId: "me",
        id: "msg1",
        resource: {
          removeLabelIds: ["UNREAD"]
        }
      });
    });
  });

  describe("markAsUnread", () => {
    it("should mark a message as unread", async () => {
      const mockGmail = {
        users: {
          messages: {
            modify: jest.fn().mockResolvedValue({
              data: { id: "msg1", labelIds: ["INBOX", "UNREAD"] }
            })
          }
        }
      };

      google.gmail.mockReturnValue(mockGmail);

      const result = await markAsUnread("msg1");

      expect(result).toEqual({ id: "msg1", labelIds: ["INBOX", "UNREAD"] });
      expect(mockGmail.users.messages.modify).toHaveBeenCalledWith({
        userId: "me",
        id: "msg1",
        resource: {
          addLabelIds: ["UNREAD"]
        }
      });
    });
  });

  describe("extractMessageContent", () => {
    it("should extract content from a simple message", () => {
      const message = {
        id: "msg1",
        snippet: "Test message snippet",
        payload: {
          headers: [
            { name: "Subject", value: "Test Subject" },
            { name: "From", value: "test@example.com" },
            { name: "Date", value: "Mon, 1 Jan 2024 12:00:00 +0000" }
          ],
          body: {
            data: Buffer.from("Test message content").toString("base64")
          },
          mimeType: "text/plain"
        }
      };

      const content = extractMessageContent(message);

      expect(content).toEqual({
        id: "msg1",
        subject: "Test Subject",
        from: "test@example.com",
        date: "Mon, 1 Jan 2024 12:00:00 +0000",
        textContent: "Test message content",
        htmlContent: "",
        snippet: "Test message snippet"
      });
    });

    it("should extract content from a multipart message", () => {
      const message = {
        id: "msg1",
        snippet: "Test message snippet",
        payload: {
          headers: [
            { name: "Subject", value: "Test Subject" },
            { name: "From", value: "test@example.com" },
            { name: "Date", value: "Mon, 1 Jan 2024 12:00:00 +0000" }
          ],
          parts: [
            {
              mimeType: "text/plain",
              body: {
                data: Buffer.from("Plain text content").toString("base64")
              }
            },
            {
              mimeType: "text/html",
              body: {
                data: Buffer.from("<p>HTML content</p>").toString("base64")
              }
            }
          ]
        }
      };

      const content = extractMessageContent(message);

      expect(content.textContent).toBe("Plain text content");
      expect(content.htmlContent).toBe("<p>HTML content</p>");
    });
  });

  describe("getUnreadCount", () => {
    it("should get unread message count", async () => {
      const mockGmail = {
        users: {
          messages: {
            list: jest.fn().mockResolvedValue({
              data: {
                messages: [{ id: "msg1" }, { id: "msg2" }, { id: "msg3" }]
              }
            })
          }
        }
      };

      google.gmail.mockReturnValue(mockGmail);

      const count = await getUnreadCount();

      expect(count).toBe(3);
      expect(mockGmail.users.messages.list).toHaveBeenCalledWith({
        userId: "me",
        q: "is:unread",
        labelIds: ["INBOX"],
        maxResults: 1
      });
    });
  });
});
