var nodemailer = require('nodemailer');

require('dotenv').config();

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.mail,
    pass: process.env.password
  }
});

var mailOptions = {
  from: process.env.mail,
  to: process.env.to,
  subject: 'Vaccine available !!',
};

module.exports = function(html) {
  transporter.sendMail({
    ...mailOptions,
    html,
  }, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}