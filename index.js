// Import express and ejs
var express = require('express');
var ejs = require('ejs');

// Import mysql module
var mysql = require('mysql2');

// Import express-session module
var session = require('express-session');

const apiRoutes = require('./routes/api'); 


// Create the express application object
const app = express();
const port = 8000;

// Create a session
app.use(session({
    secret: 'somerandomstuff',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));

// Set up the body parser
app.use(express.urlencoded({ extended: true }));

// Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', __dirname + '/views');


// Set up public folder (for css and static js)
app.use(express.static(__dirname + '/public'));

app.use('/api', apiRoutes);


// Define the database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'dawapp',
    password: 'qwertyuiop',
    database: 'login_system'
});

// Connect to the database
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});
global.db = db;

// Define the root route to render the homepage or login page based on session
app.get('/', function(req, res) {
    if (req.session.userId) {
        // If user is logged in, redirect to the homepage
        const firstName = req.session.firstName; // Get the first name from session
        res.render('home.ejs', { firstName });
    } else {
        // If not logged in, redirect to login page
        res.redirect('./users/login');
    }
});

// Define the route to render the homepage after login
app.get('/home', function(req, res) {
    // Check if user is logged in by verifying session
    if (!req.session.userId) {
        return res.redirect('/users/login'); // Redirect to login if user is not logged in
    }

    // If user is logged in, retrieve first name from session
    const firstName = req.session.firstName;  // Store first name from session
    res.render('home.ejs', { firstName });    // Render the home page with first name
});

// Load the route handlers for /users
const usersRoutes = require('./routes/users');
app.use('/users', usersRoutes);

// Route for About page
app.get('/about', function(req, res) {
    res.render('about'); // Render the about.ejs file
});

app.get('/register', (req, res) => {
    res.render('register'); // Render the register.ejs file
});

app.get('/stocks', (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.redirect('/users/login'); // Ensure the user is logged in
    }

    // Query the database to get recent searches for the logged-in user
    db.query('SELECT symbol FROM recent_searches WHERE user_id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error fetching recent searches:', err);
            return res.render('stock', { userId: req.session.userId, recentSearches: [] }); // Return an empty array on error
        }

        // Ensure results is an array and pass it to the view
        const recentSearches = results.map(result => result.symbol); // Map the results to an array of symbols

        // Render the stock page with recent searches
        res.render('stock', { userId: req.session.userId, recentSearches });
    });
});



app.get('/api/stock', async (req, res) => {
    const symbol = req.query.symbol;
    if (!symbol) {
        return res.status(400).json({ error: 'Stock symbol is required.' });
    }
    // Rely on the logic defined in routes/api.js
});


app.use('/api', apiRoutes);

// Start the web app listening
app.listen(port, () => console.log(`Node app listening on port ${port}!`));
