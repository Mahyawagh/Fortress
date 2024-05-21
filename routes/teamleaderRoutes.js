//teamleaderRoutes.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const verificationCodes = {};
// Establish MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'Fortressdb' // Your database name
});

connection.connect();

// Create table query (if needed)
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS teamleaderFortress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active'
    )
`;

connection.query(createTableQuery, (error, results, fields) => {
    if (error) {
        console.error('Error creating table:', error);
    } else {
        console.log('teamleaderFortress Table creation successful');
    }
});


function generateRandomVerificationCode(length) {
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@$&';
    let code = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
    }
    return code;
}
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // SMTP host
    port: 465, // Port
    secure: true, // false for TLS and True for ssl
    auth: {
        user: 'admin_database@fortress.co.in', // Your email address
        pass: 'ivfuqzurxtwbqpks' // Your email password
    }
});

router.post('/generateVerificationCode', async (req, res) => {
    try {
        const { email } = req.body;
        // Check if the email ends with "@fortress.co.in"
        if (!email.endsWith('@fortress.co.in')) {
            return res.status(400).json({ error: ' Please use an email ending with @fortress.co.in' });
        }

        // Check if email already exists in the database
        const checkQuery = `SELECT * FROM teamleaderFortress WHERE email = ?`;
        connection.query(checkQuery, [email], (err, results) => {
            if (err) {
                console.error('Error checking email:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            

            // Email not in use, proceed to generate verification code
            const verificationCode = generateRandomVerificationCode(6);

            // Set session data
            req.session.verificationCode = verificationCode;

            // Send verification code to the user's email
            const mailOptions = {
                from: 'admin_database@fortress.co.in',
                to: email,
                subject: 'OTP for Account',
                html: `<p>Your OTP is: <span style="text-decoration: underline; background-color: yellow;">${verificationCode}</span> Please Do Not Disclose!!!!!!</p>`
                
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending verification code:', error);
                    res.status(500).json({ error: 'Internal Server Error' });
                } else {
                    console.log('Verification code sent:', info.response);
                    res.sendStatus(200);
                }
            });
        });
    } catch (error) {
        console.error('Error generating verification code:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to handle verifying verification code
router.post('/verifyVerificationCode', async (req, res) => {
    try {
        const { verificationCode } = req.body;

        // Retrieve verification code from session
        const storedVerificationCode = req.session.verificationCode;

        if (verificationCode === storedVerificationCode) {
            // Correct verification code, allow to set password
            res.sendStatus(200);
        } else {
            // Incorrect verification code
            res.status(401).json({ error: 'Invalid verification code' });
        }
    } catch (error) {
        console.error('Error verifying verification code:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.post('/createTeamleaderAccount', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!email.endsWith('@fortress.co.in')) {
            return res.status(400).json({ error: 'Please use @fortress.co.in  your official' });
        }

        // Check if email has "@gmail.com"
        if (email.includes('@gmail.com')) {
            return res.status(400).json({ error: 'You are not authorized to create Account' });
        }
        // Check if email already exists in the database
        const checkQuery = `SELECT * FROM teamleaderFortress WHERE email = ?`;
        connection.query(checkQuery, [email], (err, results) => {
            if (err) {
                console.error('Error checking email:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (results.length > 0) {
                // Email already in use
                return res.status(400).json({ error: 'Email already in use' });
            }

            // Proceed with account creation
            const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$&]).{7,15}$/;
            if (!passwordRegex.test(password)) {
                return res.status(400).json({ error: 'Invalid password format' });
            }

            const hashedPassword = password;
            const query = `INSERT INTO teamleaderFortress (name, email, password) VALUES (?, ?, ?)`;
            connection.query(query, [name, email, password], (err, results) => {
                if (err) {
                    console.error('Error creating teamleader account:', err);
                    res.status(500).json({ error: 'Internal Server Error', details: err.message });
                    return;
                }
                console.log('teamleader account created successfully');
                res.json({ success: true });
            });
        });
    } catch (error) {
        console.error('Error creating teamleader account:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Route to handle  login
router.post('/loginTeamleader', async (req, res) => {
    try {
        const { email, password } = req.body;
        const query = `SELECT * FROM teamleaderFortress WHERE email = ?`;
        connection.query(query, [email], async (err, results) => {
            if (err) {
                console.error('Error during login:', err);
                res.status(500).json({ error: 'Internal Server Error' });1
                return;
            }
            if (results.length === 0) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }
            const user = results[0];
            // Check if user status is Active
            if (user.status !== 'Active') {
                console.log('User is not active');
                return res.status(401).json({ error: 'Your account is inactive. Please contact administrator.' });
            }
            // Compare plain text password
            if (password !== user.password) {
                console.log('Invalid credentials');
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            // Successful login
            console.log('Successful login');
            res.json({ success: true });
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
