const List = require('../../models/list');
const User = require('../../models/user');
const csvParser = require('../../utility/csvParser');

exports.createList = async (req, res) => {
    try {
        const { title, properties } = req.body;
        const list = new List({ title, properties });
        await list.save();
        res.status(201).json(list);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
