//userTeamleadersRoutes.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql');

// MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'fortressdb'
});

router.get('/teamleader', (req, res) => {
    const query = "SELECT id, name, email, password, status FROM teamleaderFortress";
    connection.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error retrieving teamleader details');
        } else {
            res.json(results); // Send data in JSON format
        }
    });
});

router.put('/user_teamleader/toggleStatus/:userId/:currentStatus', (req, res) => {
    // console.log("hiii")
    const { userId, currentStatus } = req.params;
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    const query = `UPDATE teamleaderFortress SET status = ? WHERE id = ?`;
    connection.query(query, [newStatus, userId], (err, results) => {
        console.log("res",req, results)
        console.log("query",query)
        if (err) {
            console.error(err);
            res.status(500).send('Error updating user status');
        } else {
            res.json({ message: 'User status updated successfully', newStatus });
        }
    });
});


// Route to add a new user
router.post('/teamleader/add', (req, res) => {
    const { name, email, password } = req.body;
    const query = `INSERT INTO teamleaderFortress (name, email, password, status) VALUES (?, ?, ?, 'Active')`;
    connection.query(query, [name, email, password], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error adding user');
        } else {
            res.json({ message: 'User added successfully' });
        }
    });
});

// Route to delete a user
router.delete('/teamleader/delete', (req, res) => {
    const { name, email } = req.body;
    const query = `DELETE FROM teamleaderFortress WHERE name = ? OR email = ?`;
    connection.query(query, [name, email], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error deleting user');
        } else {
            res.json({ message: 'User deleted successfully' });
        }
    });
});

// Route to update a user
router.put('/teamleader/update', (req, res) => {
    const { name, email, newPassword } = req.body;

    // Check if either name or email is provided
    if (!name && !email) {
        return res.status(400).json({ error: 'Please provide either name or email to update a user.' });
    }

    let updateFields = '';
    const updateValues = [];
    
    if (newPassword) {
        updateFields += 'password = ?, ';
        updateValues.push(newPassword);
    }

    if (name) {
        updateFields += 'name = ?, ';
        updateValues.push(name);
    }

    if (email) {
        updateFields += 'email = ?, ';
        updateValues.push(email);
    }

    updateFields = updateFields.slice(0, -2); // Remove the trailing comma and space

    const query = `UPDATE teamleaderFortress SET ${updateFields} WHERE name = ? OR email = ?`;

    // Add the current name or email as the last two parameters for the WHERE clause
    updateValues.push(req.body.name, req.body.email);

    connection.query(query, updateValues, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Error updating user' });
        } else {
            if (results.affectedRows > 0) {
                res.json({ message: 'User updated successfully' });
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        }
    });
});
module.exports = router;
