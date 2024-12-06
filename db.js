const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'dawapp',
    password: 'qwertyuiop',
    database: 'login_system',
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
    console.log('Connected to database.');
});

module.exports = db;
