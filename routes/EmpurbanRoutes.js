// EmpurbanRoutes.js
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
    const filePath = path.join(__dirname, '..', 'uploads', 'Urbaninfra', filename);

    res.sendFile(filePath);
});

// Handle display of project details
router.get('/display', (req, res) => {
    const projectId = req.query.projectId;
    db.query('SELECT * FROM Urbaninfra WHERE project_id = ?', [projectId], (err, result) => {
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
                htmlContent += `<p><strong>Photographs:</strong> <a href="/Empurban/display_project?projectId=${project.project_id}" target="_blank">View Photographs</a></p>`;
                htmlContent += `<p><strong>Documentation:</strong> <a href="/Empurban/display_documentation?projectId=${project.project_id}" target="_blank">View Documentation</a></p>`;
                htmlContent += `<p><strong>Reports:</strong> <a href="/Empurban/display_report?projectId=${project.project_id}" target="_blank">View Report</a></p>`;
                htmlContent += `<p><strong>Presentation:</strong> <a href="/Empurban/display_presentation?projectId=${project.project_id}" target="_blank">View Presentation</a></p>`;
                htmlContent += `<p><strong>Other:</strong> <a href="/Empurban/display_other?projectId=${project.project_id}" target="_blank">View Other </a></p>`;
                res.send(htmlContent);
            } else {
                res.status(404).json({ message: 'Project not found' });
            }
        }
    });
});

// API endpoint to fetch project list
router.get('/project_list', (req, res) => {
    db.query('SELECT * FROM Urbaninfra', (err, result) => {
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
        db.query('SELECT * FROM Urbaninfra WHERE project_id = ? OR year = ?', [projectId, projectId], (err, projectsResult) => {
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
        db.query('SELECT * FROM Urbaninfra WHERE project_name LIKE ?', [searchTerm], (err, projectsResult) => {
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
        SELECT project_id, 'photograph' AS type, photograph AS filename FROM Urban_Photographs WHERE photograph LIKE ? 
        UNION
        SELECT project_id, 'documentation' AS type, documentation AS filename FROM Urban_Documentation WHERE documentation LIKE ?
        UNION
        SELECT project_id, 'report' AS type, report AS filename FROM Urban_Report WHERE report LIKE ?
        UNION
        SELECT project_id, 'presentation' AS type, presentation AS filename FROM Urban_Presentation WHERE presentation LIKE ?
        UNION
        SELECT project_id, 'other' AS type, other AS filename FROM Urban_Other WHERE other LIKE ?
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


router.get('/display_project', (req, res) => {
    const projectId = req.query.projectId;

    db.query('SELECT photograph FROM Urban_Photographs WHERE project_id = ?', [projectId], (err, result) => {
        if (err) {
            console.error('Error fetching photographs:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (result.length === 0) {
            console.error('Photographs not found for project ID:', projectId);
            return res.status(404).json({ message: 'Photographs not found' });
        }

        const photographs = result.map(row => row.photograph);
        const htmlContent = generatePhotographsHTML(photographs);
        res.send(htmlContent);
    });
});

router.get('/display_documentation', (req, res) => {
    const projectId = req.query.projectId;

    db.query('SELECT documentation FROM Urban_Documentation WHERE project_id = ?', [projectId], (err, result) => {
        if (err) {
            console.error('Error fetching documentation:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (result.length === 0) {
            console.error('Documentation not found for project ID:', projectId);
            return res.status(404).json({ message: 'Documentation not found' });
        }

        const documentation = result.map(row => row.documentation);
        const htmlContent = generateDocumentationHTML(documentation);
        res.send(htmlContent);
    });
});

router.get('/display_report', (req, res) => {
    const projectId = req.query.projectId;
    db.query('SELECT report FROM Urban_Report WHERE project_id = ?', [projectId], (err, result) => {
        if (err) {
            console.error('Error fetching report:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (result.length === 0) {
            console.error('Report not found for project ID:', projectId);
            return res.status(404).json({ message: 'Report not found' });
        }
        const report = result.map(row => row.report);
        const htmlContent = generateReportHTML(report);
        res.send(htmlContent);
    });
});

router.get('/display_other', (req, res) => {
    const projectId = req.query.projectId;
    db.query('SELECT other FROM Urban_Other WHERE project_id = ?', [projectId], (err, result) => {
        if (err) {
            console.error('Error fetching other:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (result.length === 0) {
            console.error('Other not found for project ID:', projectId);
            return res.status(404).json({ message: 'Other not found' });
        }
        const other = result.map(row => row.other);
        const htmlContent = generateOtherHTML(other);
        res.send(htmlContent);
    });
});

router.get('/display_presentation', (req, res) => {
    const projectId = req.query.projectId;
    db.query('SELECT presentation FROM Urban_Presentation WHERE project_id = ?', [projectId], (err, result) => {
        if (err) {
            console.error('Error fetching presentation:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (result.length === 0) {
            console.error('Presentation not found for project ID:', projectId);
            return res.status(404).json({ message: 'Presentation not found' });
        }
        const presentation = result.map(row => row.presentation);
        const htmlContent = generatePresentationHTML(presentation);
        res.send(htmlContent);
    });
});


function generatePhotographsHTML(photographs) {
    let html = `
      <style>
        .photos {
          display: flex;
          flex-direction: column;
        }
        .photos img {
          max-width: 400px;
          margin-bottom: 20px;
          border-bottom: 1px dotted black; /* Dotted border for each image */
          padding-bottom: 20px; /* Adjust spacing between images */
        }
      </style>
      <h2>Photographs</h2>
      <div class="photos">
    `;
    photographs.forEach(photo => {
      html += `<img src="/Empurban/get-image/${photo}" alt="${photo}">`;
    });
    html += "</div>";
    return html;
  }

function generateDocumentationHTML(documentation) {
    let html = '<h2>Documentation</h2>';
    documentation.forEach(doc => {
        html += `<p><a href="/Empurban/get-image/${doc}" target="_blank">${doc}</a></p>`;
    });
    return html;
}

function generateReportHTML(report) {
    let html = '<h2>Report</h2>';
    report.forEach(report => {
        html += `<p><a href="/Empurban/get-image/${report}" target="_blank">${report}</a></p>`;
    });
    return html;
}
function generatePresentationHTML(presentation) {
    let html = '<h2>Presentation</h2>';
    presentation.forEach(presentation => {
        html += `<p><a href="/Empurban/get-image/${presentation}" target="_blank">${presentation}</a></p>`;
    });
    return html;
}

function generateOtherHTML(other) {
    let html = '<h2>Other</h2>';
    other.forEach(other => {
        html += `<p><a href="/Empurban/get-image/${other}" target="_blank">${other}</a></p>`;
    });
    return html;
}

module.exports = router;

