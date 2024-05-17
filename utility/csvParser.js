const fs = require('fs');
const csv = require('csv-parser');
const User = require('../models/user');

exports.parseCSV = (filePath, list) => {
    return new Promise((resolve, reject) => {
        const addedUsers = [];
        const failedUsers = [];
        const emailSet = new Set();

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
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
            })
            .on('end', async () => {
                try {
                    await User.insertMany(addedUsers, { ordered: false });
                    resolve({ addedUsers, failedUsers });
                } catch (err) {
                    err.writeErrors.forEach(writeError => {
                        failedUsers.push({ ...addedUsers[writeError.index], error: writeError.errmsg });
                    });
                    resolve({ addedUsers: addedUsers.filter((_, idx) => !err.writeErrors.find(err => err.index === idx)), failedUsers });
                }
            })
            .on('error', reject);
    });
};
