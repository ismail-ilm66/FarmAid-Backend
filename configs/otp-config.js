const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: false,
    auth: {
      user: process.env.APP_USER,
      pass: process.env.APP_PASS,
    },
});

module.exports = transporter;