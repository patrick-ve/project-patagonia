"use strict";

// Required CommonJS module(s)
const puppeteer = require('puppeteer')
const fs = require('fs')
const consola = require('consola')
const nodemailer = require('nodemailer')
const cron = require('node-cron');

// Required selectors
const website = {
  url: 'http://www.parquetorresdelpaine.cl/es/sistema-de-reserva-de-campamentos-1',
  DOMelement: 'div.content'
}

async function sendMail() {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'mail.mihos.net',
    port: 465,
    secure: true,
    auth: {
        user: 'patrick@skere-skraper.app',
        pass: '15uurislanG!'
    }
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Skere Skraper Engine 🚂" <patrick@skere-skraper.app>', // sender address
    to: ["vincent.de.wolf@hotmail.com", "patrick@skybox.org"], // list of receivers
    subject: "Dit is een testbericht van de skere skraper engine 🧪", // Subject line
    text: "Ga gauw naar http://www.parquetorresdelpaine.cl/es/sistema-de-reserva-de-campamentos-1 toe en BOEK DAN!!!! ", // plain text body
    html: "<h1>Ga gauw naar <a href='http://www.parquetorresdelpaine.cl/es/sistema-de-reserva-de-campamentos-1' target='_blank'>de website</a> toe en BOEK DAN!!!!</h1>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

// Run cron job every hour
cron.schedule('0 */1 * * * *', () => {

  // Immediately invoked expression
  void (async() => {

    try {

      // Open Puppeteer headless session
      const browser = await puppeteer.launch()
      const page = await browser.newPage()

      // Go to website and set viewport
      await page.goto(website.url)
      await page.setViewport({
        width: 1400,
        height: 900
      })

      // Evaluate HTML
      const html = await (await page.$eval(website.DOMelement, e => e.innerText))
        .replace(/\s/g, '')
        .replace(/(\r\n|\n|\r)/gm, '')
        .replace('\t','');
      consola.success('Success! Scraper has parsed the Document Object Model Tree')

      // State management
      let CONTENT_MATCH = false

      // Read old content
      let oldContent = fs.readFileSync('./data/oldContent.txt', 'utf8');

      // Compare old content to current content
      CONTENT_MATCH = (oldContent === html) ? true : false

      // If old content doesn't match current content, send email to Vincent and Iris
      if (!CONTENT_MATCH) {
        fs.writeFileSync('./data/oldContent.txt', html, 'utf-8')
        consola.success('New content has been detected. Proceed with sending mail to Vincent and Iris.')
        sendMail().catch(console.error);
      }

      // If old content matches current content, quit with exit status 0
      if (CONTENT_MATCH) {
        fs.writeFileSync('./data/oldContent.txt', html, 'utf-8')
        consola.info('No new content has been detected. Quit with exit status 0.')
      }

      await browser.close()

    } catch (error) {
      consola.error(new Error(error))
    }

  })()
})
