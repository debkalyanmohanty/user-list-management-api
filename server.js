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
app.use(express.static("./uploads"));

app.use('/api', routes);


app.get('/', (req, res) => {
    res.send('Welcome To User List Management API');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
