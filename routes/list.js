const express = require('express');
const multer = require('multer');
const createListController = require('../controllers/List/createList');
const addUsersController = require('../controllers/List/addUsers');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/create', createListController.createList);
router.post('/:listId/addUsers', upload.single('csv'), addUsersController.addUsers);

module.exports = router;
