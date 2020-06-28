function whatsAppHandler() {
  const user = process.env.WHATSAPP_USER;
  const password = process.env.WHATSAPP_PASSWORD;
  const from_number = "14157386170";
  const to_number = "31625642507";

  const payload = JSON.stringify({
    from: { type: "whatsapp", number: from_number },
    to: { type: "whatsapp", number: to_number },
    message: {
      content: {
        type: "text",
        text:
          "Hi Vincent, it appears the website of your camping has received an update, not later than an hour ago 🚨 Go and check it out at http://www.parquetorresdelpaine.cl/es/sistema-de-reserva-de-campamentos-1 ✈️",
      },
    },
  });

  const data = {
    user: user,
    password: password,
    payload: payload,
  };

  return data;
}

module.exports = whatsAppHandler;
