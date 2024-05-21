
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
  
  const createTableQuery = `CREATE TABLE IF NOT EXISTS OtherIndustrial (
    ref_id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255),
    year INT
  )`;
  db.query(createTableQuery, err => {
    if (err) throw err;
    console.log('table created');
  });

  const createOTDocumentationTableQuery = `CREATE TABLE IF NOT EXISTS OI_Documentation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ref_id INT,
    Documentation BLOB,
    FOREIGN KEY (ref_id) REFERENCES OtherIndustrial(ref_id)
  )`;
  db.query(createOTDocumentationTableQuery, err => {
    if (err) throw err;
    console.log('OI_Documentation table created');
  });
});

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/Others/OtherIndustrial');
  },
  filename: function(req, file, cb) {
    const refId = req.body.ref_id; 
    const originalname = file.originalname; // Get original filename
    const extension = path.extname(originalname); // Get file extension
    const modifiedFilename = `OI${refId}_${Date.now()}_${file.fieldname}${extension}`; // Generate modified filename
    //console.log('Modified Filename:', modifiedFilename); // Add this line to log the modified filename

    cb(null, modifiedFilename); // Call the callback with the modified filename
  }
});
const upload = multer({ storage: storage });

const router = express.Router();

router.use('/uploads', express.static(path.join(__dirname, '..', 'uploads', 'Others','OtherIndustrial')));

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Others', 'otherindustrial.html'));
});

router.post('/upload', upload.fields([
  { name: 'documentation', maxCount: 10 }
]), (req, res) => {
  const { name, year } = req.body;
  const documentation = req.files['documentation'] ? req.files['documentation'].map(file => file) : [];

  const formattedName = name ? `OI_${name}` : ''; 
  const sql = `INSERT INTO OtherIndustrial (Name, year) VALUES (?, ?)`;
  db.query(sql, [formattedName, year], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      const refId = result.insertId;

      documentation.forEach(doc => {
        const oldPath = doc.path;
        const extension = path.extname(doc.originalname);
        const newPath = path.join(__dirname, '..', 'uploads', 'Others','OtherIndustrial', `OI${refId}_${doc.originalname}`);
        fs.renameSync(oldPath, newPath);

        const insertDocumentationQuery = `INSERT INTO OI_Documentation (ref_id, Documentation) VALUES (?, ?)`;
        db.query(insertDocumentationQuery, [refId, `OI${refId}_${doc.originalname}`], (err, result) => {
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
  db.query('SELECT c.ref_id, c.Name, c.year, d.Documentation FROM OtherIndustrial c LEFT JOIN OI_Documentation d ON c.ref_id = d.ref_id ', (err, result) => {
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
  html += '<tr><th>REF ID</th><th>Name</th><th>Year</th><th>Documentation</th></tr>';
  const projectMap = new Map();

  projects.forEach((project, index) => {
    if (!projectMap.has(project.ref_id)) {
      projectMap.set(project.ref_id, {  documentation: [] });
    }
    const projectData = projectMap.get(project.ref_id);
    
    if (project.Documentation) {
      projectData.documentation.push(project.Documentation);
    }
  });
  // Generate rows for each project
  projectMap.forEach((projectData, refId) => {
  
    const project = projects.find(p => p.ref_id === refId);
    html += `<tr>`;
    html += `<td>${refId}</td>`; 
    html += `<td>${project.Name}</td>`;
    html += `<td>${project.year}</td>`;
    html += `<td>${projectData.documentation.join(', ')}</td>`;
    
  });

  html += '</table></div>';
  return html;
}

router.get('/get-image/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '..', 'uploads', 'Others','OtherIndustrial', filename);

  res.sendFile(filePath);
});

router.get('/display', (req, res) => {
  const refId = req.query.refId;
  db.query('SELECT * FROM OtherIndustrial WHERE ref_id = ?', [refId], (err, result) => {
    if (err) {
      console.error('Error fetching  details:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      if (result.length > 0) {
        const project = result[0];
        let htmlContent = `<h2> Details</h2>`;
        htmlContent += `<p><strong>Ref ID:</strong> ${project.ref_id}</p>`;
        htmlContent += `<p><strong>Name:</strong> ${project.Name}</p>`;
        htmlContent += `<p><strong>Year:</strong> ${project.year}</p>`;
        htmlContent += `<p><strong>Documentation:</strong> <a href="/OtherIndustrial/display_documentation?refId=${project.ref_id}" target="_blank">View Documentation</a></p>`;
        res.send(htmlContent);
      } else {
        res.status(404).json({ message: ' not found' });
      }
    }
  });
});

router.get('/search', (req, res) => {
  const searchInput = req.query.searchInput;
  db.query('SELECT * FROM OtherIndustrial WHERE ref_id = ? OR Name = ?', [searchInput, searchInput], (err, result) => {
    if (err) {
      console.error('Error searching project:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      if (result.length > 0) {
        // If project found, send JSON response with project details
        const refId = result[0].ref_id;
        res.status(200).json({ refId });
      } else {
        // If project not found, send JSON response with 404 status code
        res.status(404).json({ message: ' not found' });
      }
    }
  });
});

router.get('/display_documentation', (req, res) => {
  const refId = req.query.refId;

  db.query('SELECT Documentation FROM OI_Documentation WHERE ref_id = ?', [refId], (err, result) => {
    if (err) {
      console.error('Error fetching documentation:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (result.length === 0) {
      console.error('Documentation not found for project ID:', refId);
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
    html += `<p><a href="/OtherIndustrial/get-image/${doc}" target="_blank">${doc}</a></p>`;
  });
  return html;
}



router.post("/delete", (req, res) => {
  const searchInput = req.body.searchInput;

  // First, check if the project exists
  db.query(
    "SELECT * FROM OtherIndustrial WHERE ref_id = ? OR Name = ?",
    [searchInput, searchInput],
    (err, result) => {
      if (err) {
        console.error("Error checking project existence:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: " not found" });
      }

      const refId = result[0].ref_id;


      db.query("DELETE FROM OI_Documentation WHERE ref_id = ?", [refId], (err, result) => {
        if (err) {
          console.error("Error deleting documentation:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        db.query("DELETE FROM OtherIndustrial WHERE ref_id = ?", [refId], (err, result) => {
          if (err) {
            console.error("Error deleting  record:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          res.status(200).json({ message: "Reference record and documentation deleted successfully" });
        });
      });
    }
  );
});
const update = multer({ storage: storage }); // Update storage configuration if needed

router.post('/update', update.fields([
  { name: 'newDocumentation', maxCount: 10 }
]), (req, res) => {
  const { refId } = req.body;
  const newDocumentation = req.files['newDocumentation'] ? req.files['newDocumentation'].map(file => file) : [];

  db.query('SELECT * FROM OtherIndustrial WHERE ref_id = ? OR Name = ?', [refId, refId], (err, result) => {
    if (err) {
      console.error('Error checking  existence:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: ' not found' });
    }

    const refId = result[0].ref_id;

    // Insert new documentation files
    newDocumentation.forEach(doc => {
      const oldPath = doc.path;
      const extension = path.extname(doc.originalname);
      const newPath = path.join(__dirname, '..', 'uploads', 'Others','OtherIndustrial', `OI${refId}_${doc.originalname}`);
      fs.renameSync(oldPath, newPath);

      // Insert new documentation file name into OI_Documentation table
      const insertDocumentationQuery = `INSERT INTO OI_Documentation (ref_id, Documentation) VALUES (?, ?)`;
      db.query(insertDocumentationQuery, [refId, `OI${refId}_${doc.originalname}`], (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      });
    });

    res.status(200).json({ message: 'Documentation updated successfully' });
  });
});



module.exports = router;