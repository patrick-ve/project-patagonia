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
const homepage = {
  url:
    "http://www.parquetorresdelpaine.cl/es/sistema-de-reserva-de-campamentos-1",
  DOMelement: "div.content",
};

const bookingPage = {
  url: 'https://wubook.net/wbkd/wbk/?lcode=1470832720',
  DOMelement: 'div.l-wrap'
}

const message = {
  homepage: 'Hi Vincent, it appears the website of your camping has received an update, not later than an hour ago 🚨 Go and check it out at http://www.parquetorresdelpaine.cl/es/sistema-de-reserva-de-campamentos-1 ✈️',
  bookingModule: 'Hi Vincent, it appears the website of the camping booking module has received an update, not later than 2 hours ago 🚨 Go and check it out at https://wubook.net/wbkd/wbk/?lcode=1470832720 ✈️'
}


// WhatsApp API settings for Vonage
const options = {
  hostname: "messages-sandbox.nexmo.com",
  port: 443,
  path: "/v0.1/messages",
  method: "POST",
  authorization: {
    // TO DO: replace with environment variables
    username: process.env.WHATSAPP_USER,
    password: process.env.WHATSAPP_PASSWORD,
  },
  headers: {
    "Content-Type": "application/json",
  },
};
// Run cron job every 2 hours "
cron.schedule("0 0 */2 * * *", () => {
  // Immediately invoked expression
  void (async () => {
    try {
      // Open Puppeteer headless session
      const browser = await puppeteer.launch({args: ['--no-sandbox']});
      const page = await browser.newPage();

      // Go to website and set viewport
      await page.goto(bookingPage.url);
      await page.setViewport({
        width: 1400,
        height: 900,
      });

      // Evaluate HTML and remove all whitespace, newlines, tabs
      const html = await (
        await page.$eval(bookingPage.DOMelement, (e) => e.innerText)
      )
        .replace(/\s/g, "")
        .replace(/(\r\n|\n|\r)/gm, "")
        .replace("\t", "");
      consola.success(
        "Success! Scraper has parsed the Document Object Model Tree of the booking module"
      );

      // State management of content
      let CONTENT_MATCH = false;

      // Read old content
      let oldContent = fs.readFileSync("./data/oldContentBookingModule.txt", "utf8");

      // Compare old content to current content
      CONTENT_MATCH = oldContent === html ? true : false;

      // If old content doesn't match current content, send WhatsApp and email to Vincent and Iris
      if (!CONTENT_MATCH) {
        fs.writeFileSync("./data/oldContentBookingModule.txt", html, "utf-8");
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

        req.write(whatsApp(message.bookingModule).payload);
        req.end();

        // Send email
        sendMailHandler().catch(console.error);
      }

      // If old content matches current content, quit with exit status 0
      if (CONTENT_MATCH) {
        fs.writeFileSync("./data/oldContentBookingModule.txt", html, "utf-8");
        consola.info(
          "No new content has been detected on the booking module page. Quit with exit status 0."
        );
      }

      await browser.close();
    } catch (error) {
      consola.error(new Error(error));
    }
  })();
});


// Run cron job every hour
cron.schedule("0 0 */1 * * *", () => {
  // Immediately invoked expression
  void (async () => {
    try {
      // Open Puppeteer headless session
      const browser = await puppeteer.launch({args: ['--no-sandbox']});
      const page = await browser.newPage();

      // Go to website and set viewport
      await page.goto(homepage.url);
      await page.setViewport({
        width: 1400,
        height: 900,
      });

      // Evaluate HTML and remove all whitespace, newlines, tabs
      const html = await (
        await page.$eval(homepage.DOMelement, (e) => e.innerText)
      )
        .replace(/\s/g, "")
        .replace(/(\r\n|\n|\r)/gm, "")
        .replace("\t", "");
      consola.success(
        "Success! Scraper has parsed the Document Object Model Tree of the homepage"
      );

      // State management of content
      let CONTENT_MATCH = false;

      // Read old content
      let oldContent = fs.readFileSync("./data/oldContentHomePage.txt", "utf8");

      // Compare old content to current content
      CONTENT_MATCH = oldContent === html ? true : false;

      // If old content doesn't match current content, send WhatsApp and email to Vincent and Iris
      if (!CONTENT_MATCH) {
        fs.writeFileSync("./data/oldContentHomePage.txt", html, "utf-8");
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

        req.write(whatsApp(message.homepage).payload);
        req.end();

        // Send email
        sendMailHandler().catch(console.error);
      }

      // If old content matches current content, quit with exit status 0
      if (CONTENT_MATCH) {
        fs.writeFileSync("./data/oldContentHomePage.txt", html, "utf-8");
        consola.info(
          "No new content has been detected on the homepage. Quit with exit status 0."
        );
      }

      await browser.close();
    } catch (error) {
      consola.error(new Error(error));
    }
  })();
});
