const List = require('../../models/list');
const User = require('../../models/user');
const nodemailer = require('nodemailer');
const emailTemplates = require('../../utility/emailTemplates');
const EMAIL = process.env.EMAIL_SENDER;
const PASSWORD = process.env.EMAIL_PASSWORD;

exports.sendEmail = async (req, res) => {
    const { listId } = req.params;
    const { subject, body } = req.body;

    try {
        const lists = await List.findById(listId);
        const list = await List.findById(listId).populate('users');
        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }

        const usersToEmail = list.users.filter(user => !user.unsubscribed);

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: EMAIL,
                pass: PASSWORD
            }
        });

        const results = await Promise.all(usersToEmail.map(async (user) => {
            const emailBody = emailTemplates.generateEmailBody(body, user , lists);
            const mailOptions = {
                from: EMAIL,
                to: user.email,
                subject: subject,
                html: emailBody,
            };

            try {
                const info = await transporter.sendMail(mailOptions);
                console.log(`Email sent to ${user.email}:`, info.response);
                return { email: user.email, status: 'accepted' };
            } catch (error) {
                console.log(`Error sending email to ${user.email}:`, error);
                return { email: user.email, status: 'rejected', error: error.message };
            }
        }));

        const accepted = results.filter(result => result.status === 'accepted').map(result => result.email);
        const rejected = results.filter(result => result.status === 'rejected').map(result => ({ email: result.email, error: result.error }));

        res.status(200).json({
            message: 'Email processing completed',
            accepted: accepted,
            rejected: rejected
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
