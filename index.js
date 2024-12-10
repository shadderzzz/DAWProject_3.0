// Import express and ejs
const express = require('express');
const ejs = require('ejs');

// Import mysql module
const mysql = require('mysql2');

// Import express-session module
const session = require('express-session');

// Import API routes
const apiRoutes = require('./routes/api');

// Create the express application object
const app = express();
const port = 8000;

// Create a session
app.use(
    session({
        secret: 'somerandomstuff',
        resave: false,
        saveUninitialized: false,
        cookie: {
            expires: 600000,
        },
    })
);

// Set up the body parser
app.use(express.urlencoded({ extended: true }));

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', __dirname + '/views');

// Set up public folder (for css and static js)
app.use(express.static(__dirname + '/public'));

// Use API routes
app.use('/api', apiRoutes);

// Define the database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'dawapp',
    password: 'qwertyuiop',
    database: 'login_system',
});

// Connect to the database
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});
global.db = db;

// Define the root route
app.get('/', (req, res) => {
    const userId = req.session.userId || undefined;
    const firstName = req.session.firstName || undefined;

    res.render('index.ejs', { userId, firstName });
});

// Define the home route (redirects to `/` since it uses the same template)
app.get('/index', (req, res) => {
    return res.redirect('/');
});

// Load the route handlers for `/users`
const usersRoutes = require('./routes/users');
app.use('/users', usersRoutes);

// About page route
app.get('/about', (req, res) => {
    res.render('about'); // Render the about.ejs file
});

// Route for Register page
app.get('/register', (req, res) => {
    res.render('register'); // Render the register.ejs file
});

// Stocks page route
app.get('/stock', (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.redirect('./users/login'); // Ensure the user is logged in
    }

    // Query the database to get recent searches for the logged-in user
    db.query(
        'SELECT symbol FROM recent_searches WHERE user_id = ?',
        [userId],
        (err, results) => {
            if (err) {
                console.error('Error fetching recent searches:', err);
                return res.render('stock', {
                    userId,
                    recentSearches: [],
                }); // Return an empty array on error
            }

            // Map the results to an array of symbols
            const recentSearches = results.map((result) => result.symbol);

            // Render the stock page with recent searches
            res.render('stock', { userId, recentSearches });
        }
    );
});

// API stock search route
app.get('/api/stock', async (req, res) => {
    const symbol = req.query.symbol;
    if (!symbol) {
        return res.status(400).json({ error: 'Stock symbol is required.' });
    }
    // Rely on the logic defined in routes/api.js
});

// Start the web app listening
app.listen(port, () =>
    console.log(`Node app listening on port ${port}!`)
);
