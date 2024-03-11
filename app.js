const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3060;

app.use(bodyParser.json());

// Create MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '20132014',
    database: 'example_database'
});

connection.connect();



// Serve the HTML registration form along with script.js
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Serve the script.js file
app.get('/script.js', (req, res) => {
    res.sendFile(__dirname + '/script.js');
});


// Register route
app.post('/register', async (req, res) => {
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Insert the user into the database
        connection.query('INSERT INTO users (email, password) VALUES (?, ?)', [req.body.email, hashedPassword], (error, results) => {
            if (error) {
                res.status(500).send('Failed to register user');
            } else {
                res.status(201).send('User registered successfully');
            }
        });
    } catch {
        res.status(500).send('Failed to register user');
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
