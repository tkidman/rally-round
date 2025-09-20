const { getNewMessages, extractMessageContent } = require("../gmail/gmail");
const debug = require("debug")("tkidman:rally-round:wrcAPI:gmail2fa");

/**
 * Waits for and retrieves the EA security code from Gmail
 * @param {Object} page - Puppeteer page object
 * @param {number} timeout - Maximum time to wait for email (default: 60000ms = 1 minute)
 * @returns {Promise<string>} The 6-digit security code
 */
const waitForSecurityCode = async (page, timeout = 60000) => {
  const startTime = Date.now();
  const maxAttempts = Math.floor(timeout / 5000); // Check every 5 seconds

  debug("Waiting for EA security code email...");

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // Check for new messages with EA security code subject
      const messages = await getNewMessages({
        subject: "Your EA Security Code is:",
        maxResults: 5,
        since: new Date(Date.now() - 2 * 60 * 1000), // Last 2 minutes
      });

      if (messages.length > 0) {
        // Find the most recent message with security code
        for (const message of messages) {
          const content = extractMessageContent(message);

          // Extract the 6-digit code from the subject or body
          const codeMatch =
            content.subject.match(/Your EA Security Code is:\s*(\d{6})/) ||
            content.textContent.match(/Your EA Security Code is:\s*(\d{6})/) ||
            content.htmlContent.match(/Your EA Security Code is:\s*(\d{6})/);

          if (codeMatch) {
            const securityCode = codeMatch[1];
            debug(`Found security code: ${securityCode}`);
            return securityCode;
          }
        }
      }

      // Wait 5 seconds before next check
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const elapsed = Date.now() - startTime;
      debug(
        `Checked for security code (${Math.floor(elapsed / 1000)}s elapsed)...`
      );
    } catch (error) {
      debug(`Error checking for security code: ${error.message}`);
      // Continue trying even if there's an error
    }
  }

  throw new Error(`Security code not found within ${timeout / 1000} seconds`);
};

/**
 * Handles the 2FA process by clicking the authorization button and entering the code
 * @param {Object} page - Puppeteer page object
 * @returns {Promise<boolean>} True if 2FA was handled successfully
 */
const handle2FA = async (page) => {
  try {
    debug("Checking for 2FA requirements...");
    // await page.waitForNavigation({ waitUntil: "networkidle2" });
    // Wait a bit for the page to fully load and any dynamic content to appear
    debug("Waiting for page to stabilize...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // First, let's see what's on the page
    const currentUrl = page.url();
    debug(`Current URL: ${currentUrl}`);

    // Look for the specific button you mentioned - try this first
    debug("Looking for #btnSendCode...");
    let twoFactorButton = await page.$("#btnSendCode");

    if (twoFactorButton) {
      debug("Found #btnSendCode button!");
      const buttonText = await page.evaluate(
        (el) => el.textContent.trim(),
        twoFactorButton
      );
      debug(`Button text: "${buttonText}"`);
    } else {
      debug("#btnSendCode not found, trying alternative selectors...");

      // Try alternative selectors
      const alternativeSelectors = ['a[role="button"]', "button", "a"];

      for (const selector of alternativeSelectors) {
        const elements = await page.$$(selector);
        debug(`Found ${elements.length} ${selector} elements`);

        for (const element of elements) {
          const text = await page.evaluate(
            (el) => el.textContent.trim(),
            element
          );
          if (
            text.toLowerCase().includes("send") &&
            text.toLowerCase().includes("code")
          ) {
            twoFactorButton = element;
            debug(`Found potential 2FA button: "${text}"`);
            break;
          }
        }

        if (twoFactorButton) break;
      }
    }

    if (!twoFactorButton) {
      debug("No 2FA button found - 2FA may not be required");
      // Additional debugging: log all available buttons and links
      const allButtons = await page.$$("button, a[role='button'], a");
      debug(`Found ${allButtons.length} potential clickable elements`);
      for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
        const text = await page.evaluate(
          (el) => el.textContent.trim(),
          allButtons[i]
        );
        const tagName = await page.evaluate((el) => el.tagName, allButtons[i]);
        const id = await page.evaluate((el) => el.id, allButtons[i]);
        debug(`  ${tagName}${id ? `#${id}` : ""}: "${text}"`);
      }
      return false;
    }

    // Click the 2FA button
    debug("Clicking 2FA button...");
    await twoFactorButton.click();
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Wait for the security code input field to appear
    debug("Waiting for security code input field...");
    const codeInputSelectors = [
      'input[type="text"]',
      'input[placeholder*="code"]',
      'input[placeholder*="Code"]',
      'input[name*="code"]',
      'input[id*="code"]',
      "#verificationCode",
      "#securityCode",
      "#code",
    ];

    let codeInput = null;
    for (const selector of codeInputSelectors) {
      try {
        codeInput = await page.$(selector);
        if (codeInput) {
          debug(`Found code input with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    if (!codeInput) {
      throw new Error("Security code input field not found");
    }

    // Get the security code from Gmail
    debug("Retrieving security code from Gmail...");
    const securityCode = await waitForSecurityCode(page);

    // Enter the security code
    debug(`Entering security code: ${securityCode}`);
    await codeInput.click();
    await codeInput.type(securityCode);

    // Look for submit button (both button and anchor elements)
    const submitSelectors = [
      "#btnSubmit", // Specific ID for EA's submit button
      'a[role="button"]:contains("Sign in")',
      'a[role="button"]:contains("Verify")',
      'a[role="button"]:contains("Submit")',
      'a[role="button"]:contains("Continue")',
      'button[type="submit"]',
      'button:contains("Verify")',
      'button:contains("Submit")',
      'button:contains("Continue")',
      'button:contains("Next")',
      'button:contains("Sign in")',
      "#submit",
      "#verify",
      "#continue",
    ];

    let submitButton = null;
    for (const selector of submitSelectors) {
      try {
        submitButton = await page.$(selector);
        if (submitButton) {
          debug(`Found submit button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    // Alternative: look for submit button by text content
    if (!submitButton) {
      debug(
        "Submit button not found with selectors, trying text-based search..."
      );
      const elements = await page.$$("button, a[role='button']");
      for (const element of elements) {
        const text = await page.evaluate(
          (el) => el.textContent.trim().toLowerCase(),
          element
        );
        if (
          text.includes("sign in") ||
          text.includes("verify") ||
          text.includes("submit") ||
          text.includes("continue")
        ) {
          submitButton = element;
          debug(`Found submit button by text content: "${text}"`);
          break;
        }
      }
    }

    if (submitButton) {
      debug("Clicking submit button...");
      await submitButton.click();
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    debug("2FA process completed successfully");
    return true;
  } catch (error) {
    debug(`Error handling 2FA: ${error.message}`);
    throw error;
  }
};

module.exports = {
  waitForSecurityCode,
  handle2FA,
};
