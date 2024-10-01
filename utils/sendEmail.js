const nodeMailer = require('nodemailer');

const sendEmail = async(options)=>{
    const transporter = nodeMailer.createTransport({
        service: process.env.SMTP_SERVICE,
        auth:{
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;