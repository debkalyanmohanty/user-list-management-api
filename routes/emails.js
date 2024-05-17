const express = require('express');
const sendEmailController = require('../controllers/Emails/sendEmail');
const unsubscriveEmailController = require('../controllers/Emails/unsubscribe');

const router = express.Router();

router.post('/:listId/sendEmail', sendEmailController.sendEmail);
router.post('/unsubscribe/:id', unsubscriveEmailController.unsubscribe);

module.exports = router;
