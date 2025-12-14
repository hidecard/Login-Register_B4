require('dotenv').config();
const express = require('express');
const mongoose = require('./config/db');
const session = require('express-session');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static('view'))

app.use(session({
    secret: process.env.JWT_Secret || 'defaultSecret',
    resave: false,
    saveUninitialized: true
}));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('login', { message : null })
})

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));