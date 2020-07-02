function whatsAppHandler(message) {
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
        text: message,
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
