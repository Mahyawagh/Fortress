const express = require('express');
const router = express.Router();
const mysql = require('mysql');
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
        user: 'WaghMahya14111998@Gmail.com', // Your email address
        pass: 'oboppxxezshxddjy' // Your email password
    }
});

router.post('/generateVerificationCode', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email.endsWith('@fortress.co.in')) {
            return res.status(400).json({ error: 'Please use an email ending with @fortress.co.in' });
        }

        const checkQuery = `SELECT * FROM ${tables} WHERE email = ?`;
        connection.query(checkQuery, [email], (err, results) => {
            if (err) {
                console.error('Error checking email:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            const verificationCode = generateRandomVerificationCode(6);
            req.session.verificationCode = verificationCode;

            const mailOptions = {
                from: 'WaghMahya14111998@Gmail.com',
                to: email,
                subject: 'Verification Code for Account Creation',
                text: `Your verification code is: ${verificationCode}`
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

router.post('/verifyVerificationCode', async (req, res) => {
    try {
        const { verificationCode } = req.body;
        const storedVerificationCode = req.session.verificationCode;

        if (verificationCode === storedVerificationCode) {
            res.sendStatus(200);
        } else {
            res.status(401).json({ error: 'Invalid verification code' });
        }
    } catch (error) {
        console.error('Error verifying verification code:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

async function checkCredentialsInTables(email, password, tables) {
    return new Promise((resolve, reject) => {
        const queries = tables.map(tables => {
            return new Promise((resolve, reject) => {
                const query = `SELECT * FROM ${tables} WHERE email = ?`;
                connection.query(query, [email], (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    if (results.length > 0 && results[0].password === password) {
                        return resolve({ valid: true, status: results[0].status });
                    }
                    resolve({ valid: false });
                });
            });
        });

        Promise.all(queries)
            .then(results => {
                const validResult = results.find(result => result.valid);
                if (validResult) {
                    resolve(validResult);
                } else {
                    resolve({ valid: false });
                }
            })
            .catch(err => {
                reject(err);
            });
    });
}

router.post('/loginReference', async (req, res) => {
    try {
        const { email, password } = req.body;
        const tables = ['teamleaderFortress', 'managementFortress', 'verticalsFortress', 'employeeFortress'];

        const result = await checkCredentialsInTables(email, password, tables);

        if (!result.valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (result.status !== 'Active') {
            return res.status(401).json({ error: 'Your account is inactive. Please contact administrator.' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
