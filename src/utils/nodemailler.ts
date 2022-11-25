import EnvVars from "@src/declarations/major/EnvVars";
import nodemailer from "nodemailer";

// const nodemailer = require("nodemailer");
// require("dotenv").config();

const mailer = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: EnvVars.email.name,
    pass: EnvVars.email.password
  },
  tls: {
    rejectUnauthorized: true
  }
});

export default mailer;
// module.exports = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: process.env.SHOP_GMAIL_USERNAME,
//     pass: process.env.SHOP_GMAIL_PASSWORD
//   },
//   tls: {
//     rejectUnauthorized: true
//   }
// });
