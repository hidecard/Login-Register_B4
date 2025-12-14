const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../model/User');
const router = express.Router();

// Register page
router.get('/register', (req, res) => {
    res.render('register', { message: null });
});

// Register logic
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    const role = req.body.role || 'user';

    if (!name || !email || !password) {
        return res.render('register', { message: 'All fields are required' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.render('register', { message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({ name, email, password: hashedPassword, role });
        await user.save();

        res.redirect('/api/auth/login');
    } catch (err) {
        console.error(err);
        res.render('register', { message: 'Server error' });
    }
});

// Login page
router.get('/login', (req, res) => {
    res.render('login', { message: null });
});

// Login logic
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('login', { message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { message: 'Invalid credentials' });
        }

        req.session.user = user;

        return user.role === 'admin'
            ? res.redirect('/api/auth/dashboard')
            : res.redirect('/api/auth/home');

    } catch (error) {
        console.error(error);
        res.render('login', { message: 'Server error, please try again' });
    }
});

// Home
router.get('/home', (req, res) => {
    if (!req.session.user) return res.redirect('/api/auth/login');
    res.render('home', { user: req.session.user });
});

// Admin dashboard
router.get('/dashboard', (req, res) => {
    if (!req.session.user) return res.redirect('/api/auth/login');
    if (req.session.user.role !== 'admin') return res.redirect('/api/auth/home');
    res.render('dashboard', { user: req.session.user });
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/api/auth/login'));
});

module.exports = router;
