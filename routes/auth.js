const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../model/User');
const router = express.Router();

router.get('/register', (req, res) => {
    res.render('register',{ message : null})
})

router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
        return res.render('register' , { message : "All field are required"})
    }
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.render('register', { message : "Email already register" } )
        }
        const hashedpassword = await bcrypt.hash(password, 10);
        user = await User({ name, email, password: hashedpassword, role })
        await user.save();
        return res.redirect('/api/auth/login')
    } catch (err) {
        console.log(err);
    }
})

router.get('/login', async (res, req) => {
    res.render('login',{ message : null})
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
        try {
            const user = await User.findOne({ email });
                if (!user) return res.render('login', { message: 'User not found' });
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) return res.render('login', { message: 'Invalid credentials' });
                req.session.user = user;
                return user.role === 'admin' ? res.redirect('/api/auth/dashboard') : res.redirect('/api/auth/home');
            } catch (error) {
        console.error(error);
            res.render('login', { message: 'Server error, please try again' });
        }
});


router.get('/home', async (req, res) => {
    if (!req.session.user) return res.redirect('/api/auth/login')
    res.render('home',{ user : req.session.user})
})
router.get('/dashboard', (req, res) => {
if (!req.session.user) return res.redirect('/api/auth/login');
if (req.session.user.role !== 'admin') return res.redirect('/api/auth/home');
res.render('dashboard', { user: req.session.user });
});

router.get('/logout', (req, res) => {
req.session.destroy(() => res.redirect('/api/auth/login'));
});