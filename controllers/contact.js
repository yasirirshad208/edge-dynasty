const Contact = require('../models/Contact');
const ResponseHandler = require('../utils/resHandler');
const ErrorHandler = require('../utils/errorHandler');
const sendEmail = require('../utils/sendEmail');


exports.createContact = async (req, res, next) => {
    try {
        const { firstName, lastName, phone, email, message } = req.body;

        const contact = new Contact({
            firstName,
            lastName,
            phone,
            email,
            message
        });

        await contact.save();

        

        const emailOptions = {
            email: process.env.NOTIFICATION_EMAIL, 
            subject: 'New Contact Form Submission',
            message: `You have a new contact form submission from:
            
            Name: ${firstName} ${lastName}
            Phone: ${phone}
            Email: ${email}
            
            Message:
            ${message}`
        };

        // Send email
        await sendEmail(emailOptions);

        return new ResponseHandler(res, 200, true, 'Contact saved and email sent', contact);

    } catch (error) {
        return next(new ErrorHandler(error, 500));
    }
}




