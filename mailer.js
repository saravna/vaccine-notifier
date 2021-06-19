var nodemailer = require('nodemailer');

require('dotenv').config();

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.mail,
    pass: process.env.password
  }
});


module.exports = function(html, to) {
  return new Promise((resolve, reject) => {
    transporter.sendMail({
      to,
      subject: 'Vaccine available !!',
      html,
    }, function(error, info){
      if (error) {
        console.log(error);
        reject(error);
      } else {
        console.log('Email sent: ' + info.response);
        resolve(info);
      }
    });
  })
}