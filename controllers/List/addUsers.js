const List = require('../../models/list');
const User = require('../../models/user');

exports.addUsers = async (req, res) => {
    const { listId } = req.params;
    const csvFile = req.file;

    try {
        const list = await List.findById(listId);
        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }

        const { addedUsers, failedUsers } = await parseCSV(csvFile.buffer.toString(), list);
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

async function parseCSV(csvContent, list) {
    return new Promise((resolve, reject) => {
        const addedUsers = [];
        const failedUsers = [];
        const emailSet = new Set();

        const lines =    csvContent
                        .split('\n')
                        .filter(line => line.trim());
        const headers = lines[0]
                        .split(',')
                        .map(header => header.trim());

        lines.slice(1).forEach(line => {
            const values = line.split(',').map(value => value.trim());
            if (values.length !== headers.length) {
                failedUsers.push({ line, error: 'Row length does not match header length' });
                return;
            }

            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index];
            });

            const { name, email, city, ...properties } = row;
            if (!name || !email) {
                failedUsers.push({ ...row, error: 'Missing required fields' });
                return;
            }

            if (emailSet.has(email)) {
                failedUsers.push({ ...row, error: 'Duplicate email' });
                return;
            }

            emailSet.add(email);

            const userProps = {};
            list.properties.forEach(prop => {
                userProps[prop.title] = properties[prop.title] || prop.fallbackValue;
            });

            const cityFallback = list.properties.find(prop => prop.title === 'city')?.fallbackValue || '';
            const userCity = city || cityFallback;

            const user = new User({ name, email, properties: userProps, city: userCity });

            addedUsers.push(user);
        });

        User.insertMany(addedUsers, { ordered: false })
            .then(() => resolve({ addedUsers, failedUsers }))
            .catch(err => {
                if (err.writeErrors) {
                    err.writeErrors.forEach(writeError => {
                        failedUsers.push({ ...addedUsers[writeError.index], error: writeError.errmsg });
                    });
                    resolve({
                        addedUsers: addedUsers.filter((_, idx) => !err.writeErrors.find(error => error.index === idx)),
                        failedUsers
                    });
                } else {
                    reject(err);
                }
            });
    });
}
