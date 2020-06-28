const nodemailer = require("nodemailer");

async function sendMailHandler() {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: process.env.MAIL_SERVER,
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_ACCOUNT,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Skere Skraper Engine 🚂" <patrick@skere-skraper.app>', // sender address
    to: [
      "vincent.de.wolf@hotmail.com",
      "i_deheer93@hotmail.com",
      "patrick@skybox.org",
      "patrick@patrickvaneverdingen.design",
    ], // list of receivers
    subject: "De website van de camping is geüpdatet!", // Subject line
    text:
      "Ga gauw naar http://www.parquetorresdelpaine.cl/es/sistema-de-reserva-de-campamentos-1 toe en BOEK DIE CAMPING!!!! ", // plain text body
    html:
      "<h1>Ga gauw naar <a href='http://www.parquetorresdelpaine.cl/es/sistema-de-reserva-de-campamentos-1' target='_blank'>de website</a> toe en BOEK DIE CAMPING!!!!</h1>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
}

module.exports = sendMailHandler;
