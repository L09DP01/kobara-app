const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'lorvensondp4282@gmail.com',
    pass: 'ammogezufhedehwl'
  }
});

async function main() {
  try {
    let info = await transporter.sendMail({
      from: '"Test" <no-reply@kobara.app>',
      to: "lorvensondp4282@gmail.com",
      subject: "Test SMTP",
      text: "Test email from nodemailer",
    });
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

main();
