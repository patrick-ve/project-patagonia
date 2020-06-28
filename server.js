"use strict";
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Required CommonJS module(s)
const https = require("https");
const puppeteer = require("puppeteer");
const fs = require("fs");
const consola = require("consola");
const cron = require("node-cron");
const sendMailHandler = require("./utils/sendMailHandler.js");
const whatsApp = require("./utils/whatsAppHandler.js");

// Required selectors
const website = {
  url:
    "http://www.parquetorresdelpaine.cl/es/sistema-de-reserva-de-campamentos-1",
  DOMelement: "div.content",
};

// WhatsApp API settings for Vonage
const options = {
  hostname: "messages-sandbox.nexmo.com",
  port: 443,
  path: "/v0.1/messages",
  method: "POST",
  authorization: {
    // TO DO: replace with environment variables
    username: whatsApp().user,
    password: whatsApp().password,
  },
  headers: {
    "Content-Type": "application/json",
  },
};

// Run cron job every hour
cron.schedule("0 0 */1 * * *", () => {
  // Immediately invoked expression
  void (async () => {
    try {
      // Open Puppeteer headless session
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      // Go to website and set viewport
      await page.goto(website.url);
      await page.setViewport({
        width: 1400,
        height: 900,
      });

      // Evaluate HTML and remove all whitespace, newlines, tabs
      const html = await (
        await page.$eval(website.DOMelement, (e) => e.innerText)
      )
        .replace(/\s/g, "")
        .replace(/(\r\n|\n|\r)/gm, "")
        .replace("\t", "");
      consola.success(
        "Success! Scraper has parsed the Document Object Model Tree"
      );

      // State management of content
      let CONTENT_MATCH = false;

      // Read old content
      let oldContent = fs.readFileSync("./data/oldContent.txt", "utf8");

      // Compare old content to current content
      CONTENT_MATCH = oldContent === html ? true : false;

      // If old content doesn't match current content, send WhatsApp and email to Vincent and Iris
      if (!CONTENT_MATCH) {
        fs.writeFileSync("./data/oldContent.txt", html, "utf-8");
        consola.success(
          "New content has been detected. Proceed with sending mail and WhatsApp to Vincent and Iris."
        );

        // Trigger Vonage webhook for WhatsApp notification
        const req = https.request(options, (res) => {
          console.log(`statusCode: ${res.statusCode}`);

          res.on("data", (d) => {
            process.stdout.write(d);
          });
        });

        req.on("error", (e) => {
          consola.error(e);
        });

        req.write(whatsApp().payload);
        req.end();

        // Send email
        sendMailHandler().catch(console.error);
      }

      // If old content matches current content, quit with exit status 0
      if (CONTENT_MATCH) {
        fs.writeFileSync("./data/oldContent.txt", html, "utf-8");
        consola.info(
          "No new content has been detected. Quit with exit status 0."
        );
      }
      console.log();

      await browser.close();
    } catch (error) {
      consola.error(new Error(error));
    }
  })();
});
