//BDtransverticalsRoutes.js
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
    const filePath = path.join(__dirname, '..', 'uploads', 'BusinessDevelopment','BDTransport', filename);

    res.sendFile(filePath);
});

// Handle display of project details
router.get('/display', (req, res) => {
    const projectId = req.query.projectId;
    db.query('SELECT * FROM BDTransport WHERE project_id = ?', [projectId], (err, result) => {
      if (err) {
        console.error('Error fetching project details:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        if (result.length > 0) {
          const project = result[0];
          let htmlContent = `<h2>Project Details</h2>`;
          htmlContent += `<p><strong>Project ID:</strong> ${project.project_id}</p>`;
          htmlContent += `<p><strong>Project Name:</strong> ${project.project_name}</p>`;
          htmlContent += `<p><strong>Year:</strong> ${project.year}</p>`;
          htmlContent += `<p><strong>Tender Sight:</strong> <a href="/BDtransverticals/display_tendersight?projectId=${project.project_id}" target="_blank">View Tender Sight</a></p>`;
          htmlContent += `<p><strong>Tentative Letter:</strong> <a href="/BDtransverticals/display_tentativeletter?projectId=${project.project_id}"target="_blank">View Tentative Letters</a></p>`;
          htmlContent += `<p><strong>Bids Financial:</strong> <a href="/BDtransverticals/display_bidsfinancial?projectId=${project.project_id}"target="_blank">View Bids Financial Report </a></p>`;
          htmlContent += `<p><strong>Bids Technical:</strong> <a href="/BDtransverticals/display_bidstechnical?projectId=${project.project_id}"target="_blank">View Bids Technical Report</a></p>`;
          res.send(htmlContent);
        } else {
          res.status(404).json({ message: 'Project not found' });
        }
      }
    });
  });

// API endpoint to fetch project list
router.get('/project_list', (req, res) => {
    db.query('SELECT * FROM BDTransport', (err, result) => {
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

  // Check if the search input matches a project_id, project_name, or year
  if (!isNaN(searchInput)) {
      // If the search input is a number, assume it's a project_id or year
      const projectId = parseInt(searchInput);
      db.query('SELECT * FROM BDTransport WHERE project_id = ? OR year = ?', [projectId, projectId], (err, projectsResult) => {
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
      db.query('SELECT * FROM BDTransport WHERE project_name LIKE ?', [searchTerm], (err, projectsResult) => {
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
      SELECT project_id, 'tendersight' AS type, tendersight AS filename FROM BDTrans_Tendersight WHERE tendersight LIKE ? 
      UNION
      SELECT project_id, 'tentativeletter' AS type, tentativeletter AS filename FROM BDTrans_Tentativeletter WHERE tentativeletter LIKE ?
      UNION
      SELECT project_id, 'bidsfinancial' AS type, bidsfinancial AS filename FROM BDTrans_Bidsfinancial WHERE bidsfinancial LIKE ?
      UNION
      SELECT project_id, 'bidstechnical' AS type, bidstechnical AS filename FROM BDTrans_Bidstechnical WHERE bidstechnical LIKE ?

  `;
  db.query(sql, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm], (err, result) => {
      if (err) {
          callback(err, null);
      } else {
          // Here, we are constructing the file path using the correct filename
          const filesResult = result.map(row => {
              return {
                  project_id: row.project_id,
                  type: row.type,
                  filename: `${row.filename}`
              };
          });
          callback(null, filesResult);
      }
  });
}


router.get('/display_tendersight', (req, res) => {
    const projectId = req.query.projectId;
  
    db.query('SELECT tendersight FROM BDTrans_Tendersight WHERE project_id = ?', [projectId], (err, result) => {
      if (err) {
        console.error('Error fetching tendersight:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      if (result.length === 0) {
        console.error('Tendersight not found for project ID:', projectId);
        return res.status(404).json({ message: 'Tendersight not found' });
      }
  
      const tendersight = result.map(row => row.tendersight);
      const htmlContent = generateTendersightHTML(tendersight);
      res.send(htmlContent);
    });
  });
  router.get('/display_tentativeletter', (req, res) => {
    const projectId = req.query.projectId;
  
    db.query('SELECT tentativeletter FROM BDTrans_Tentativeletter WHERE project_id = ?', [projectId], (err, result) => {
      if (err) {
        console.error('Error fetching tentative letter:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      if (result.length === 0) {
        console.error('tentativeletter not found for project ID:', projectId);
        return res.status(404).json({ message: 'tentativeletter not found' });
      }
  
      const tentativeletter = result.map(row => row.tentativeletter);
      const htmlContent = generateTentativeletterHTML(tentativeletter);
      res.send(htmlContent);
    });
  });
  router.get('/display_bidsfinancial', (req, res) => {
    const projectId = req.query.projectId;
  
    db.query('SELECT bidsfinancial FROM BDTrans_Bidsfinancial WHERE project_id = ?', [projectId], (err, result) => {
      if (err) {
        console.error('Error fetching bidsfinancial files:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      if (result.length === 0) {
        console.error('Bidsfinancial files not found for project ID:', projectId);
        return res.status(404).json({ message: 'Bidsfinancial files not found' });
      }
  
      const bidsfinancial = result.map(row => row.bidsfinancial);
      const htmlContent = generateBidsfinancialHTML(bidsfinancial);
      res.send(htmlContent);
    });
  });
  
  router.get('/display_bidstechnical', (req, res) => {
      const projectId = req.query.projectId;
      db.query('SELECT bidstechnical FROM BDTrans_Bidstechnical WHERE project_id = ?', [projectId], (err, result) => {
          if (err) {
              console.error('Error fetching bidstechnical files:', err);
              return res.status(500).json({ error: 'Internal Server Error' });
          }
          if (result.length === 0) {
              console.error('Bidstechnical files not found for project ID:', projectId);
              return res.status(404).json({ message: 'Bidstechnical files not found' });
          }
          const bidstechnical = result.map(row => row.bidstechnical);
          const htmlContent = generateBidstechnicalHTML(bidstechnical);
          res.send(htmlContent);
      });
  });
  
  
  function generateTendersightHTML(tendersight) {
      let html = '<h2>Tendersight</h2>';
      tendersight.forEach(tendersight => {
          html += `<p><a href="/BDtransverticals/get-image/${tendersight}" target="_blank">${tendersight}</a></p>`;
      });
      return html;
  }
  
  function generateTentativeletterHTML(tentativeletter) {
      let html = '<h2>Tentative Letter</h2>';
      tentativeletter.forEach(tentativeletter => {
          html += `<p><a href="/BDtransverticals/get-image/${tentativeletter}" target="_blank">${tentativeletter}</a></p>`;
      });
      return html;
  }
  
  function generateBidsfinancialHTML(bidsfinancial) {
      let html = '<h2>Bids Financial</h2>';
      bidsfinancial.forEach(bidsfinancial => {
          html += `<p><a href="/BDtransverticals/get-image/${bidsfinancial}" target="_blank">${bidsfinancial}</a></p>`;
      });
      return html;
  }
  
  function generateBidstechnicalHTML(bidstechnical) {
      let html = '<h2>Bids Technical</h2>';
      bidstechnical.forEach(bidstechnical => {
          html += `<p><a href="/BDtransverticals/get-image/${bidstechnical}" target="_blank">${bidstechnical}</a></p>`;
      });
      return html;
  }

module.exports = router;

