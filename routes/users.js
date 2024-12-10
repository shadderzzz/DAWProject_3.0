const express = require("express");
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
const { check, validationResult } = require('express-validator');
const expressSanitizer = require('express-sanitizer');
const router = express.Router();

const saltRounds = 10;

// Middleware for sanitization
router.use(expressSanitizer());

// Middleware to redirect if the user is not logged in
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
};

// Render registration form
router.get('/register', (req, res) => {
    res.render('register.ejs', { errorMessage: null, first: '', last: '', email: '', username: '' });
});

// Handle registration form submission
router.post('/registered', [
    check('email').isEmail().withMessage('Please provide a valid email address'),
    check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
], (req, res, next) => {
    const errors = validationResult(req);
    const sanitized = {
        first: req.sanitize(req.body.first),
        last: req.sanitize(req.body.last),
        email: req.sanitize(req.body.email),
        username: req.sanitize(req.body.username),
        password: req.sanitize(req.body.password)
    };

    if (!errors.isEmpty()) {
        return res.render('register.ejs', {
            errorMessage: errors.array().map(err => err.msg).join(', '),
            ...sanitized
        });
    }

    // Check for existing email or username
    const checkQuery = 'SELECT * FROM users WHERE email = ? OR username = ?';
    db.query(checkQuery, [sanitized.email, sanitized.username], (err, results) => {
        if (err) return next(err);

        if (results.length > 0) {
            return res.render('register.ejs', {
                errorMessage: 'Email or Username already exists.',
                ...sanitized
            });
        }

        // Hash password and insert new user
        bcrypt.hash(sanitized.password, saltRounds, (err, hashedPassword) => {
            if (err) return next(err);

            const insertQuery = `
                INSERT INTO users (username, first_name, last_name, email, hashedPassword)
                VALUES (?, ?, ?, ?, ?)`;
            db.query(insertQuery, [sanitized.username, sanitized.first, sanitized.last, sanitized.email, hashedPassword], (err) => {
                if (err) return next(err);

                res.redirect('/users/login');
            });
        });
    });
});

// Render login form
router.get('/login', (req, res) => {
    res.render('login.ejs', { errorMessage: null });
});

// Handle login form submission
router.post('/login', (req, res, next) => {
    const sanitized = {
        username: req.sanitize(req.body.username),
        password: req.sanitize(req.body.password)
    };

    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [sanitized.username], (err, results) => {
        if (err) return next(err);

        if (results.length === 0) {
            return res.render('login.ejs', { errorMessage: 'User not found.' });
        }

        const user = results[0];
        bcrypt.compare(sanitized.password, user.hashedPassword, (err, isMatch) => {
            if (err) return next(err);

            if (!isMatch) {
                return res.render('login.ejs', { errorMessage: 'Invalid password.' });
            }

            // Store user session details
            req.session.userId = user.id;
            req.session.firstName = user.first_name;

            res.redirect('/home');
        });
    });
});

// Logout route
router.get('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout failed:', err);
            return res.redirect('/');
        }
        res.redirect('/users/login');
    });
});

// Export router
module.exports = router;
