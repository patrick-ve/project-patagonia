const nodemailer = require('nodemailer')

async function sendMail() {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: process.env.MAIL_SERVER,
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAIL_ACCOUNT,
        pass: process.env.MAIL_PASSWORD
    }
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Skere Skraper Engine 🚂" <patrick@skere-skraper.app>', // sender address
    to: ["vincent.de.wolf@hotmail.com", "i_deheer93@hotmail.com", "patrick@skybox.org", "patrick@patrickvaneverdingen.design"], // list of receivers
    subject: "De website van de camping is niet geüpdatet!", // Subject line
    text: "Sad", // plain text body
    html: "<h1>Sad</h1>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
}

module.exports = sendMail
