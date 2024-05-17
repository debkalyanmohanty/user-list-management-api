const express = require('express');

const router = express.Router();

const List = require('./list');
const Emails = require('./emails');

router.use('/list',List);
router.use('/emails',Emails);

module.exports = router;