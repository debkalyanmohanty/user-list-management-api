const mongoose = require('mongoose');

const ListSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    properties: [
        {
            title: { 
                type: String,
                required: true 
            },
            fallbackValue: { 
                type: String, 
                required: true 
            },
        },
    ],
    users: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
});

module.exports = mongoose.model('List', ListSchema);
