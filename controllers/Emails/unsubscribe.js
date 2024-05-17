const List = require('../../models/list');
const User = require('../../models/user');
const nodemailer = require('nodemailer');
const emailTemplates = require('../../utility/emailTemplates');

exports.unsubscribe = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findOne({ _id: id });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.unsubscribed = true;
        await user.save();

        res.status(200).json({ message: 'Unsubscribed successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};