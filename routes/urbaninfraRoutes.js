//urbaninfraRoutes.js
const express = require('express');
const multer = require('multer');
const mysql = require('mysql');
const path = require('path');
const fs = require('fs');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'fortressdb'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL Connected');
  
  const createTableQuery = `CREATE TABLE IF NOT EXISTS Urbaninfra  (
    project_id INT AUTO_INCREMENT PRIMARY KEY,
    project_name VARCHAR(255),
    year INT
  )`;
  db.query(createTableQuery, err => {
    if (err) throw err;
    console.log('Urbaninfra table created');
  });

  const createPhotographsTableQuery = `CREATE TABLE IF NOT EXISTS Urban_Photographs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    photograph BLOB,
    FOREIGN KEY (project_id) REFERENCES Urbaninfra(project_id)
  )`;
  db.query(createPhotographsTableQuery, err => {
    if (err) throw err;
    console.log('Urban_Photographs table created');
  });

  const createDocumentationTableQuery = `CREATE TABLE IF NOT EXISTS Urban_Documentation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    documentation BLOB,
    FOREIGN KEY (project_id) REFERENCES Urbaninfra(project_id)
  )`;
  db.query(createDocumentationTableQuery, err => {
    if (err) throw err;
    console.log('Urban_Documentation table created');
  });
  const createReportTableQuery = `CREATE TABLE IF NOT EXISTS Urban_Report (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    report BLOB,
    FOREIGN KEY (project_id) REFERENCES Urbaninfra(project_id)
  )`;
  db.query(createReportTableQuery, err => {
    if (err) throw err;
    console.log('Urban_Report table created');
  });
  const createPresentationTableQuery = `CREATE TABLE IF NOT EXISTS Urban_Presentation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    presentation BLOB,
    FOREIGN KEY (project_id) REFERENCES Urbaninfra(project_id)
  )`;
  db.query(createPresentationTableQuery, err => {
    if (err) throw err;
    console.log('Urban_Presentation table created');
  });
  const createOtherTableQuery = `CREATE TABLE IF NOT EXISTS Urban_Other (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    other BLOB,
    FOREIGN KEY (project_id) REFERENCES Urbaninfra(project_id)
  )`;
  db.query(createOtherTableQuery, err => {
    if (err) throw err;
    console.log('Urban_Other table created');
  });
  
});

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/Urbaninfra');
  },
  filename: function(req, file, cb) {
    const projectId = req.body.project_id; // Retrieve project ID from request body
    const originalname = file.originalname; // Get original filename
    const extension = path.extname(originalname); // Get file extension
    const modifiedFilename = `Urban${projectId}_${Date.now()}_${file.fieldname}${extension}`; // Generate modified filename
    //console.log('Modified Filename:', modifiedFilename); // Add this line to log the modified filename

    cb(null, modifiedFilename); // Call the callback with the modified filename
  }
});
const upload = multer({ storage: storage });

const router = express.Router();

router.use('/uploads', express.static(path.join(__dirname, '..', 'uploads', 'Urbaninfra')));

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Urbaninfra', 'urbaninfra.html'));
});

router.post('/upload', upload.fields([
  
  { name: 'photographs', maxCount: 10 },
  { name: 'documentation', maxCount: 10 },
  { name: 'report', maxCount:10},
  { name: 'presentation', maxCount: 10 },
  { name: 'other', maxCount: 10}

]), (req, res) => {
  const { project_name, year } = req.body;
  const photographs = req.files['photographs'] ? req.files['photographs'].map(file => file) : [];
  const documentation =req.files['documentation'] ? req.files['documentation'].map(file => file) : [];
  const report = req.files['report'] ? req.files['report'].map(file => file) : [];
  const presentation = req.files['presentation'] ? req.files['presentation'].map(file => file) : []; // Handle presentation files
  const other = req.files['other'] ? req.files['other'].map(file => file) : []; // Handle other files
  

  const formattedProjectName = `Urban${project_name ? '_' + project_name : ''}`; // Update formatted project name
  const sql = `INSERT INTO Urbaninfra (project_name, year) VALUES (?, ?)`;
  db.query(sql, [formattedProjectName, year], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      const projectId = result.insertId;
      const formattedProjectName = `Urban${projectId}_${project_name}`;
      // Now that we have the projectId, we can handle file uploads
      photographs.forEach(photo => {
        const oldPath = photo.path;
        const extension = path.extname(photo.originalname);
        const newPath = path.join(__dirname, '..', 'uploads', 'Urbaninfra', `Urban${projectId}_${photo.originalname}`);
        fs.renameSync(oldPath, newPath);

        const insertPhotographQuery = `INSERT INTO Urban_Photographs (project_id, photograph) VALUES (?, ?)`;
        db.query(insertPhotographQuery, [projectId, `Urban${projectId}_${photo.originalname}`], (err, result) => {
          if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
          }
        });
      });

      documentation.forEach(doc => {
        const oldPath = doc.path;
        const extension = path.extname(doc.originalname);
        const newPath = path.join(__dirname, '..', 'uploads', 'Urbaninfra', `Urban${projectId}_${doc.originalname}`);
        fs.renameSync(oldPath, newPath);

        const insertDocumentationQuery = `INSERT INTO Urban_Documentation (project_id, documentation) VALUES (?, ?)`;
        db.query(insertDocumentationQuery, [projectId, `Urban${projectId}_${doc.originalname}`], (err, result) => {
          if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
          }
        });
      });
      report.forEach(report => {
        const oldPath = report.path;
        const extension = path.extname(report.originalname);
        const newPath = path.join(__dirname, '..', 'uploads', 'Urbaninfra', `Urban${projectId}_${report.originalname}`);
        fs.renameSync(oldPath, newPath);

        const insertReportQuery = `INSERT INTO Urban_Report (project_id, report) VALUES (?, ?)`;
        db.query(insertReportQuery, [projectId, `Urban${projectId}_${report.originalname}`], (err, result) => {
          if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
          }
        });
      });
      presentation.forEach(presentationFile => {
        const oldPath = presentationFile.path;
        const extension = path.extname(presentationFile.originalname);
        const newPath = path.join(__dirname, '..', 'uploads', 'Urbaninfra', `Urban${projectId}_${presentationFile.originalname}`);
        fs.renameSync(oldPath, newPath);

        const insertPresentationQuery = `INSERT INTO Urban_Presentation (project_id, presentation) VALUES (?, ?)`;
        db.query(insertPresentationQuery, [projectId, `Urban${projectId}_${presentationFile.originalname}`], (err, result) => {
          if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
          }
        });
      });
      other.forEach(other => {
        const oldPath = other.path;
        const extension = path.extname(other.originalname);
        const newPath = path.join(__dirname, '..', 'uploads', 'Urbaninfra', `Urban${projectId}_${other.originalname}`);
        fs.renameSync(oldPath, newPath);
        
        const insertOtherQuery = `INSERT INTO Urban_Other (project_id, other) VALUES (?, ?)`;
        db.query(insertOtherQuery, [projectId, `Urban${projectId}_${other.originalname}`], (err, result) => {
          if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
          }
        });
      });

      res.status(200).json({ message: 'Files uploaded and project inserted successfully' });
    }
  });
});


router.get('/projectsHTML', (req, res) => {
  db.query('SELECT u.project_id, u.project_name, u.year, p.photograph, d.documentation, r.report, pr.presentation, o.other FROM Urbaninfra u LEFT JOIN Urban_Photographs p ON u.project_id = p.project_id LEFT JOIN Urban_Documentation d ON u.project_id = d.project_id LEFT JOIN Urban_Report r ON u.project_id = r.project_id LEFT JOIN Urban_Presentation pr ON u.project_id = pr.project_id LEFT JOIN Urban_Other o ON u.project_id = o.project_id', (err, result) => {
    if (err) {
      console.error('Error fetching projects:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      const projects = result;
      const html = generateProjectsHTML(projects);
      res.send(html);
    }
  });
});


function generateProjectsHTML(projects) {
  
  let html = '<h2>Projects Details</h2>';
  html += '<div style="overflow-x:auto;">'; // Add horizontal scrolling
  html += '<table border="1">';
  html += '<tr><th>Project ID</th><th>Project Name</th><th>Year</th><th>Photographs</th><th>Documentation</th><th>Report</th><th>Presentation</th><th>Other</th></tr>';

  // Create a map to store photographs and documentation and etc by project ID
  const projectMap = new Map();

  // // Group photographs and documentation , etc by project ID
  projects.forEach((project, index) => {
    if (!projectMap.has(project.project_id)) {
      projectMap.set(project.project_id, { photographs: [], documentation: [], report: [], presentation: [], other: [] });
    }
    const projectData = projectMap.get(project.project_id);
    if (project.photograph) {
      projectData.photographs.push(project.photograph);
    }
    if (project.documentation) {
      projectData.documentation.push(project.documentation);
    }
    if (project.report) {
      projectData.report.push(project.report);
    }
    if(project.presentation){
      projectData.presentation.push(project.presentation);
    }
    if (project.other) {
      projectData.other.push(project.other);
    }
  });

  // Generate rows for each project
  projectMap.forEach((projectData, projectId) => {
    
    const project = projects.find(p => p.project_id === projectId);
    html += `<tr>`;
    html += `<td>${projectId}</td>`; // Display the project ID
    html += `<td>${project.project_name}</td>`;
    html += `<td>${project.year}</td>`;
    html += `<td>${projectData.photographs.join(', ')}</td>`; // Display photographs
    html += `<td>${projectData.documentation.join(', ')}</td>`; // Display documentation
    html += `<td>${projectData.report.join(', ')}</td>`; // Display report
    html += `<td>${projectData.presentation.join(', ')}</td>`;
    html += `<td>${projectData.other.join(', ')}</td>`;
    html += `</tr>`;
  });

  html += '</table></div>';
  return html;
}


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
        htmlContent += `<p><strong>Photographs:</strong> <a href="/urbaninfra/display_project?projectId=${project.project_id}" target="_blank">View Photographs</a></p>`;
        htmlContent += `<p><strong>Documentation:</strong> <a href="/urbaninfra/display_documentation?projectId=${project.project_id}" target="_blank">View Documentation</a></p>`;
        htmlContent += `<p><strong>Report:</strong> <a href="/urbaninfra/display_report?projectId=${project.project_id}"target="_blank">View Report</a></p>`;
        htmlContent += `<p><strong>Presentation:</strong> <a href="/urbaninfra/display_presentation?projectId=${project.project_id}"target="_blank">View Presentation </a></p>`;
        htmlContent += `<p><strong>Other:</strong> <a href="/urbaninfra/display_other?projectId=${project.project_id}"target="_blank">View Other</a></p>`;
        res.send(htmlContent);
      } else {
        res.status(404).json({ message: 'Project not found' });
      }
    }
  });
});

// Handle search of projects by project ID or project name
router.get('/search', (req, res) => {
  const searchInput = req.query.searchInput;
  db.query('SELECT * FROM Urbaninfra WHERE project_id = ? OR project_name = ?', [searchInput, searchInput], (err, result) => {
    if (err) {
      console.error('Error searching project:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      if (result.length > 0) {
        // If project found, send JSON response with project details
        const projectId = result[0].project_id;
        res.status(200).json({ projectId });
      } else {
        // If project not found, send JSON response with 404 status code
        res.status(404).json({ message: 'Project not found' });
      }
    }
  });
});
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
router.get('/display_presentation', (req, res) => {
  const projectId = req.query.projectId;

  db.query('SELECT presentation FROM Urban_Presentation WHERE project_id = ?', [projectId], (err, result) => {
    if (err) {
      console.error('Error fetching presentation files:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (result.length === 0) {
      console.error('Presentation files not found for project ID:', projectId);
      return res.status(404).json({ message: 'Presentation files not found' });
    }

    const presentations = result.map(row => row.presentation);
    const htmlContent = generatePresentationHTML(presentations);
    res.send(htmlContent);
  });
});

router.get('/display_other', (req, res) => {
  const projectId = req.query.projectId;

  db.query('SELECT other FROM Urban_Other WHERE project_id = ?', [projectId], (err, result) => {
    if (err) {
      console.error('Error fetching other files:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (result.length === 0) {
      console.error('other files not found for project ID:', projectId);
      return res.status(404).json({ message: 'Other files not found' });
    }

    const other = result.map(row => row.other);
    const htmlContent = generateOtherHTML(other);
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
    html += `<img src="/urbaninfra/get-image/${photo}" alt="${photo}">`;
  });
  html += "</div>";
  return html;
}


function generateDocumentationHTML(documentation) {
  let html = '<h2>Documentation</h2>';
  documentation.forEach(doc => {
    html += `<p><a href="/urbaninfra/get-image/${doc}" target="_blank">${doc}</a></p>`;
  });
  return html;
}

function generateReportHTML(report) {
  let html = '<h2>Report</h2>';
  report.forEach(report => {
    html += `<p><a href="/urbaninfra/get-image/${report}" target="_blank">${report}</a></p>`;
  });
  return html;
}
function generatePresentationHTML(presentations) {
  let html = '<h2>Presentations</h2>';
  presentations.forEach(presentation => {
    html += `<p><a href="/urbaninfra/get-image/${presentation}" target="_blank">${presentation}</a></p>`;
  });
  return html;
}
function generateOtherHTML(other) {
  let html = '<h2>Other</h2>';
  other.forEach(other => {
    html += `<p><a href="/urbaninfra/get-image/${other}" target="_blank">${other}</a></p>`;
  });
  return html;
}
router.get('/delete', (req, res) => {
  const searchInput = req.query.searchInput;
  // Check if the project exists
  db.query('SELECT * FROM Urbaninfra WHERE project_id = ? OR project_name = ?', [searchInput, searchInput], (err, result) => {
      if (err) {
          console.error('Error checking project existence:', err);
          res.status(500).json({ error: 'Internal Server Error' });
      } else {
          if (result.length === 0) {
              res.status(404).json({ message: 'Project not found' });
          } else {
              const projectId = result[0].project_id;
              // Delete associated rows from other tables first
              db.query('DELETE FROM Urban_Photographs WHERE project_id = ?', [projectId], (err, result) => {
                  if (err) {
                      console.error('Error deleting photographs:', err);
                      res.status(500).json({ error: 'Internal Server Error' });
                  } else {
                      db.query('DELETE FROM Urban_Documentation WHERE project_id = ?', [projectId], (err, result) => {
                          if (err) {
                              console.error('Error deleting documentation:', err);
                              res.status(500).json({ error: 'Internal Server Error' });
                          } else {
                              db.query('DELETE FROM Urban_Report WHERE project_id = ?', [projectId], (err, result) => {
                                  if (err) {
                                      console.error('Error deleting report:', err);
                                      res.status(500).json({ error: 'Internal Server Error' });
                                  } else {
                                      db.query('DELETE FROM Urban_Presentation WHERE project_id = ?', [projectId], (err, result) => {
                                          if (err) {
                                              console.error('Error deleting presentation:', err);
                                              res.status(500).json({ error: 'Internal Server Error' });
                                          } else {
                                              db.query('DELETE FROM Urban_Other WHERE project_id = ?', [projectId], (err, result) => {
                                                  if (err) {
                                                      console.error('Error deleting other files:', err);
                                                      res.status(500).json({ error: 'Internal Server Error' });
                                                  } else {
                                                      db.query('DELETE FROM Urbaninfra WHERE project_id = ?', [projectId], (err, result) => {
                                                          if (err) {
                                                              console.error('Error deleting project:', err);
                                                              res.status(500).json({ error: 'Internal Server Error' });
                                                          } else {
                                                              res.status(200).json({ message: 'Project and associated files deleted successfully' });
                                                          }
                                                      });
                                                  }
                                              });
                                          }
                                      });
                                  }
                              });
                          }
                      });
                  }
              });
          }
      }
  });
});


router.post('/update', upload.fields([
  { name: 'photographs', maxCount: 10 },
  { name: 'documentation', maxCount: 10 },
  {name: 'report', maxCount: 10},
  {name:  'presentation', maxCount: 10},
  {name:  'other', maxCount: 10}
]), (req, res) => {
  const projectId = req.body.project_id;
  const photographs = req.files['photographs'] ? req.files['photographs'] : [];
  const documentation = req.files['documentation'] ? req.files['documentation'] : [];
  const report = req.files['report'] ? req.files['report'] : [];
  const presentation = req.files['presentation'] ? req.files['presentation'] : [];
  const other = req.files['other'] ? req.files['other'] : [];

   // Function to generate the new filename
   const generateNewFilename = (projectId, originalFilename) => {
    const extension = path.extname(originalFilename);
    const filenameWithoutExtension = path.basename(originalFilename, extension);
    return `Urban${projectId}_${filenameWithoutExtension}${extension}`;
  };
   photographs.forEach(photo => {
    const oldPath = photo.path;
    const newPath = path.join(__dirname, '..', 'uploads', 'Urbaninfra', generateNewFilename(projectId, photo.originalname));
    fs.renameSync(oldPath, newPath);
    const newFilename = generateNewFilename(projectId, photo.originalname);

    db.query(`INSERT INTO Urban_Photographs (project_id, photograph) VALUES (?, ?)`, [projectId, newFilename], (err) => {
      if (err) {
        console.error('Error updating photographs:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  });

  documentation.forEach(doc => {
    const oldPath = doc.path;
    const newPath = path.join(__dirname, '..', 'uploads', 'Urbaninfra', generateNewFilename(projectId, doc.originalname));
    fs.renameSync(oldPath, newPath);
    const newFilename = generateNewFilename(projectId, doc.originalname);

    db.query(`INSERT INTO Urban_Documentation (project_id, documentation) VALUES (?, ?)`, [projectId, newFilename], (err) => {
      if (err) {
        console.error('Error updating documentation:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  });

  report.forEach(file => {
    const oldPath = file.path;
    const newPath = path.join(__dirname, '..', 'uploads', 'Urbaninfra', generateNewFilename(projectId, file.originalname));
    fs.renameSync(oldPath, newPath);
    const newFilename = generateNewFilename(projectId, file.originalname);

    db.query(`INSERT INTO Urban_Report (project_id, report) VALUES (?, ?)`, [projectId, newFilename], (err) => {
      if (err) {
        console.error('Error updating report:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  });

  presentation.forEach(file => {
    const oldPath = file.path;
    const newPath = path.join(__dirname, '..', 'uploads', 'Urbaninfra', generateNewFilename(projectId, file.originalname));
    fs.renameSync(oldPath, newPath);
    const newFilename = generateNewFilename(projectId, file.originalname);

    db.query(`INSERT INTO Urban_Presentation (project_id, presentation) VALUES (?, ?)`, [projectId, newFilename], (err) => {
      if (err) {
        console.error('Error updating presentation:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  });

  other.forEach(file => {
    const oldPath = file.path;
    const newPath = path.join(__dirname, '..', 'uploads', 'Urbaninfra', generateNewFilename(projectId, file.originalname));
    fs.renameSync(oldPath, newPath);
    const newFilename = generateNewFilename(projectId, file.originalname);

    db.query(`INSERT INTO Urban_Other (project_id, other) VALUES (?, ?)`, [projectId, newFilename], (err) => {
      if (err) {
        console.error('Error updating other:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  });

  res.status(200).json({ message: 'Files are updated successfully' });
});


module.exports = router;