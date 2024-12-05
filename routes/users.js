// Create a new router
const express = require("express");
const bcrypt = require('bcryptjs'); // Added bcrypt for password hashing
const mysql = require('mysql2'); // Import mysql2 for database interaction
const saltRounds = 10; // Salt rounds for bcrypt hashing
const router = express.Router(); // Create a new router
const { check, validationResult } = require('express-validator'); // Import express-validator for validation
const expressSanitizer = require('express-sanitizer'); // Import express-sanitizer for input sanitation

// Use express-sanitizer middleware
router.use(expressSanitizer());

// Middleware to redirect if the user is not logged in
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('users/login'); // Redirect to the login page if not logged in
    }
    next(); // Proceed to the next middleware or route handler
};

// Render the registration form
router.get('/register', function (req, res, next) {
    res.render('register.ejs');
});

// Handle the registration form submission with validation and sanitization
router.post('/registered', [
    check('email').isEmail().withMessage('Please provide a valid email address'),
    check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
], function (req, res, next) {
    const errors = validationResult(req);

    // Sanitize the user input
    req.body.first = req.sanitize(req.body.first);
    req.body.last = req.sanitize(req.body.last);
    req.body.email = req.sanitize(req.body.email);
    req.body.username = req.sanitize(req.body.username);

    if (!errors.isEmpty()) {
        // If validation fails, re-render the register page with error messages and form values
        return res.render('register.ejs', {
            errorMessage: errors.array().map(error => error.msg).join(', '),
            first: req.body.first,
            last: req.body.last,
            email: req.body.email,
            username: req.body.username
        });
    }

    // Check if the email or username already exists in the database
    const email = req.body.email;
    const username = req.body.username;

    // SQL query to check for existing email and username
    const checkQuery = 'SELECT * FROM users WHERE email = ? OR username = ?';

    db.query(checkQuery, [email, username], function (err, results) {
        if (err) {
            return next(err); // Handle error
        }

        // If the email or username already exists
        if (results.length > 0) {
            return res.render('register.ejs', {
                errorMessage: 'Email or Username already exists. Please choose another one.',
                first: req.body.first,
                last: req.body.last,
                email: req.body.email,
                username: req.body.username
            });
        }

        // Continue with the registration logic if no duplicates are found
        const plainPassword = req.body.password;
        const firstName = req.body.first;
        const lastName = req.body.last;

        bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
            if (err) {
                return next(err); // Handle error
            }

            const sql = 'INSERT INTO users (username, first_name, last_name, email, hashedPassword) VALUES (?, ?, ?, ?, ?)';
            db.query(sql, [username, firstName, lastName, email, hashedPassword], function (err, result) {
                if (err) {
                    return next(err); // Handle error
                }

                // Redirect to login page after successful registration
                res.redirect('/login'); // Redirect to login page after successful registration
            });
        });
    });
});

// Render the login form
router.get('/login', function (req, res, next) {
    res.render('login.ejs'); // Renders the login form
});

// Handle login form submission
router.post('/login', function (req, res, next) {
    // Sanitize user input
    req.body.username = req.sanitize(req.body.username);
    req.body.password = req.sanitize(req.body.password);

    const username = req.body.username;
    const plainPassword = req.body.password;

    // Query the database to find the user
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], function (err, results) {
        if (err) {
            return next(err); // Handle error
        }

        // If user not found
        if (results.length === 0) {
            return res.render('login.ejs', { errorMessage: 'User not found.' }); // Handle error for invalid user
        }

        const user = results[0]; // Assuming the username is unique

        // Compare the provided password with the hashed password in the database
        bcrypt.compare(plainPassword, user.hashedPassword, function (err, isMatch) {
            if (err) {
                return next(err); // Handle error
            }

            if (!isMatch) {
                return res.render('login.ejs', { errorMessage: 'Invalid password.' }); // Handle invalid password
            }

            // Save user session here, when login is successful
            req.session.userId = user.id;
            req.session.firstName = user.first_name;  // Store first name in session

            // Redirect to the homepage
            res.redirect('/home');
        });
    });
});

// Route to logout the user and destroy the session
router.get('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/');  // Redirect to home or login page if logout fails
        }
        res.redirect('/users/login');  // Redirect to login page after logout
    });
});

// Export the router object so index.js can access it
module.exports = router;
