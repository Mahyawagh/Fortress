//HRprevioussearchRoutes.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'fortressdb'
});

db.connect(err => {
    if (err) {
        console.error('Database connection error:', err);
        throw err;
    }
    console.log('Connected to the database');
});

router.get('/get-image/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', 'uploads', 'HumanResource','PreviousEmployee', filename);

    res.sendFile(filePath);
});

// Handle display of project details
router.get('/display', (req, res) => {
    const empId = req.query.empId;
    db.query('SELECT * FROM HRprevious WHERE emp_id = ?', [empId], (err, result) => {
      if (err) {
        console.error('Error fetching Employee details:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        if (result.length > 0) {
          const project = result[0];
          let htmlContent = `<h2>Employee Details</h2>`;
          htmlContent += `<p><strong>Emp ID:</strong> ${project.emp_id}</p>`;
          htmlContent += `<p><strong>Emp Name:</strong> ${project.Employee_name}</p>`;
          htmlContent += `<p><strong>Year:</strong> ${project.year}</p>`;
          htmlContent += `<p><strong>Documentation:</strong> <a href="/HRprevioussearch/display_documentation?empId=${project.emp_id}" target="_blank">View Documentation</a></p>`;
          res.send(htmlContent);
        } else {
          res.status(404).json({ message: 'Employee not found' });
        }
      }
    });
  });

// API endpoint to fetch project list
router.get('/project_list', (req, res) => {
  db.query('SELECT * FROM HRprevious', (err, result) => {
      if (err) {
          console.error('Error fetching project list:', err);
          res.status(500).json({ error: 'Internal Server Error' });
      } else {
          res.status(200).json(result);
      }
  });
});

// Handle search of projects by project ID, project name, or year, and files by keyword
router.get('/search', (req, res) => {
  const searchInput = req.query.searchInput;
  const searchTerm = `%${searchInput}%`; // Preparing search term with wildcard for SQL LIKE operator

  if (!isNaN(searchInput)) {
      const projectId = parseInt(searchInput);
      db.query('SELECT * FROM HRprevious WHERE emp_id = ? OR year = ?', [projectId, projectId], (err, projectsResult) => {
          if (err) {
              console.error('Error searching projects:', err);
              return res.status(500).json({ error: 'Internal Server Error' });
          }
          // Search for files by keyword
          searchFiles(searchTerm, (filesErr, filesResult) => {
              if (filesErr) {
                  console.error('Error searching files:', filesErr);
                  return res.status(500).json({ error: 'Internal Server Error' });
              }
              res.status(200).json({ projects: projectsResult, files: filesResult });
          });
      });
  } else {
      // If the search input is not a number, search by project name
      db.query('SELECT * FROM HRprevious WHERE EMployee_name LIKE ?', [searchTerm], (err, projectsResult) => {
          if (err) {
              console.error('Error searching projects:', err);
              return res.status(500).json({ error: 'Internal Server Error' });
          }
          // Search for files by keyword
          searchFiles(searchTerm, (filesErr, filesResult) => {
              if (filesErr) {
                  console.error('Error searching files:', filesErr);
                  return res.status(500).json({ error: 'Internal Server Error' });
              }
              res.status(200).json({ projects: projectsResult, files: filesResult });
          });
      });
  }
});

// Function to search files by keyword

function searchFiles(searchTerm, callback) {
  const sql = `
      SELECT emp_id, 'documentation' AS type, documentation AS filename FROM Previous_Documentation WHERE documentation LIKE ?
      
  `;
  db.query(sql, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm], (err, result) => {
      if (err) {
          callback(err, null);
      } else {
          // Here, we are constructing the file path using the correct filename
          const filesResult = result.map(row => {
              return {
                  emp_id: row.emp_id,
                  type: row.type,
                  filename: `${row.filename}`
              };
          });
          callback(null, filesResult);
      }
  });
}


router.get('/display_documentation', (req, res) => {
    const empId = req.query.empId;
  
    db.query('SELECT Documentation FROM Previous_Documentation WHERE emp_id = ?', [empId], (err, result) => {
      if (err) {
        console.error('Error fetching documentation:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      if (result.length === 0) {
        console.error('Documentation not found for project ID:', empId);
        return res.status(404).json({ message: 'Documentation not found' });
      }
  
      const documentation = result.map(row => row.Documentation);
      const htmlContent = generateDocumentationHTML(documentation);
      res.send(htmlContent);
    });
  });
  
  
 function generateDocumentationHTML(documentation) {
    let html = '<h2>Documentation</h2>';
    documentation.forEach(doc => {
      html += `<p><a href="/HRprevioussearch/get-image/${doc}" target="_blank">${doc}</a></p>`;
    });
    return html;
  }
  
module.exports = router;

