require('dotenv').config()

const express = require('express');
const connectDB = require('./database/connect');
const routes = require('./routes/route');

const app = express();
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // To handle form submissions
app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use('/api', routes);


app.get('/create-list', (req, res) => {
    res.render('create-list');
});

app.get('/upload-csv', async (req, res) => {
    const List = require('./models/list');
    const lists = await List.find();
    res.render('upload-csv', { lists });
});
app.get('/send-email', async (req, res) => {
    const List = require('./models/list');
    try {
        const lists = await List.find();
        res.render('send-email', { lists });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load lists' });
    }
});
app.get('/unsubscribe-success', (req, res) => {
    res.render('unsubscribe-success');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
