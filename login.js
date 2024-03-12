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
    password: '',
    database: 'my_database'
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


// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Check if email exists in the database
  connection.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) throw err;

    if (results.length === 0) {
      return res.status(401).json({ message: 'Email not found' });
    }

    const storedHashedPassword = results[0].password;

    // Compare entered password with stored hashed password
    if (bcrypt.compareSync(password, storedHashedPassword)) {
      // Generate JWT
      const token = jwt.sign({ email }, 'your-secret-key', { expiresIn: '1h' });
      return res.json({ token });
    } else {
      return res.status(401).json({ message: 'Invalid password' });
    }
  });
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
