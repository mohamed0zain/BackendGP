// const express = require('express');
// const bodyParser = require('body-parser');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

// const app = express();
// const PORT = 3060;

// app.use(bodyParser.json());

// // Dummy database to store users
// const users = [];

// // Root route
// app.get('/', (req, res) => {
//     res.send('Welcome to the Node.js application');
// });

// // Register route
// app.post('/register', async (req, res) => {
//     try {
//         // Hash the password
//         const hashedPassword = await bcrypt.hash(req.body.password, 10);
        
//         // Create a new user object
//         const user = { username: req.body.username, password: hashedPassword };
        
//         // Store the user in the database
//         users.push(user);
        
//         res.status(201).send('User registered successfully');
//     } catch {
//         res.status(500).send('Failed to register user');
//     }
// });

// // Login route
// app.post('/login', async (req, res) => {
//     // Find the user by username
//     const user = users.find(user => user.username === req.body.username);
    
//     if (user == null) {
//         return res.status(400).send('User not found');
//     }

//     try {
//         // Compare the provided password with the hashed password
//         if (await bcrypt.compare(req.body.password, user.password)) {
//             // Generate JWT token
//             const token = jwt.sign({ username: user.username }, 'secretkey');
//             res.json({ token });
//         } else {
//             res.status(401).send('Incorrect password');
//         }
//     } catch {
//         res.status(500).send('Failed to authenticate');
//     }
// });

// // Protected route
// app.get('/profile', authenticateToken, (req, res) => {
//     res.send('Welcome to your profile');
// });

// // Middleware to authenticate token
// function authenticateToken(req, res, next) {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];
//     if (token == null) return res.sendStatus(401);
  
//     jwt.verify(token, 'secretkey', (err, user) => {
//         if (err) return res.sendStatus(403);
//         req.user = user;
//         next();
//     });
// }

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });


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
