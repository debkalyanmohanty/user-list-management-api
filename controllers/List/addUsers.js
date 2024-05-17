const List = require('../../models/list');
const User = require('../../models/user');
const csvParser = require('../../utility/csvParser');

exports.addUsers = async (req, res) => {
    const { listId } = req.params;
    const csvFile = req.file;

    try {
        const list = await List.findById(listId);
        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }

        const { addedUsers, failedUsers } = await csvParser.parseCSV(csvFile.path, list);
        list.users.push(...addedUsers.map(user => user._id));
        await list.save();

        res.status(200).json({
            addedCount: addedUsers.length,
            failedCount: failedUsers.length,
            totalCount: list.users.length,
            failedUsers,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
