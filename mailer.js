const nodemailer = require('nodemailer');

const { mailAuth, mailSend } = require('./configs/configs_gitignore');

const mailer = async (html) => {

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: mailAuth.user, // generated ethereal user
      pass: mailAuth.pass, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: mailSend.from, // sender address
    to: mailSend.to, // list of receivers
    subject: 'cars list', // Subject line
    text: 'cars list', // plain text body
    html
  });

  console.log(`email sent: ${info.messageId}`);
};

module.exports = mailer;
