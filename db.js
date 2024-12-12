const mysql = require('mysql2');

let connection;

function handleDisconnect() {
    connection = mysql.createConnection({
        host: 'localhost',
        user: 'dawapp',
        password: 'qwertyuiop',
        database: 'login_system'
    });

    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL, retrying in 2 seconds...', err);
            setTimeout(handleDisconnect, 2000);
        } else {
            console.log('Connected to MySQL');
        }
    });

    connection.on('error', (err) => {
        console.error('MySQL error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

handleDisconnect();

module.exports = connection;
