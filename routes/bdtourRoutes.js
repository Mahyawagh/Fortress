//bdttourRoutes.js
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
  
  const createTableQuery = `CREATE TABLE IF NOT EXISTS BDTour (
    project_id INT AUTO_INCREMENT PRIMARY KEY,
    project_name VARCHAR(255),
    year INT
  )`;
  db.query(createTableQuery, err => {
    if (err) throw err;
    console.log('BDTour table created');
  });

  const createTendersightTableQuery = `CREATE TABLE IF NOT EXISTS BDTour_Tendersight (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    tendersight BLOB,
    FOREIGN KEY (project_id) REFERENCES BDTour(project_id)
  )`;
  db.query(createTendersightTableQuery, err => {
    if (err) throw err;
    console.log('BDTour_TenderSight table created');
  });

  const createTentativeletterTableQuery = `CREATE TABLE IF NOT EXISTS BDTour_Tentativeletter (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    tentativeletter BLOB,
    FOREIGN KEY (project_id) REFERENCES BDTour(project_id)
  )`;
  db.query(createTentativeletterTableQuery, err => {
    if (err) throw err;
    console.log('BDTour_Documentation table created');
  });
  const createBidsfinancialTableQuery = `CREATE TABLE IF NOT EXISTS BDTour_Bidsfinancial (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    bidsfinancial BLOB,
    FOREIGN KEY (project_id) REFERENCES BDTour(project_id)
  )`;
  db.query(createBidsfinancialTableQuery, err => {
    if (err) throw err;
    console.log('BDTour_BidsFinancial table created');
  });
  const createBidstechnicalTableQuery = `CREATE TABLE IF NOT EXISTS BDTour_Bidstechnical (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    bidstechnical BLOB,
    FOREIGN KEY (project_id) REFERENCES BDTour(project_id)
  )`;
  db.query(createBidstechnicalTableQuery, err => {
    if (err) throw err;
    console.log('BDTour_Bidstechnical table created');
  });
  
  
});

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/BusinessDevelopment/BDTour');
  },
  filename: function(req, file, cb) {
    const projectId = req.body.project_id; // Retrieve project ID from request body
    const originalname = file.originalname; // Get original filename
    const extension = path.extname(originalname); // Get file extension
    const modifiedFilename = `BDTour${projectId}_${Date.now()}_${file.fieldname}${extension}`; // Generate modified filename
    cb(null, modifiedFilename); // Call the callback with the modified filename
  }
});
const upload = multer({ storage: storage });

const router = express.Router();

router.use('/uploads', express.static(path.join(__dirname, '..', 'uploads', 'BusinessDevelopment','BDTour')));

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'BusinessDevelopment', 'tourismbusiness.html'));
});

router.post('/upload', upload.fields([
  
  { name: 'tendersight', maxCount: 10 },
  { name: 'tentativeletter', maxCount: 10 },
  { name: 'bidsfinancial', maxCount:10},
  { name: 'bidstechnical', maxCount: 10 }
  ]), (req, res) => {
  const { project_name, year } = req.body;
  const tendersight = req.files['tendersight'] ? req.files['tendersight'].map(file => file) : [];
  const tentativeletter =req.files['tentativeletter'] ? req.files['tentativeletter'].map(file => file) : [];
  const bidsfinancial = req.files['bidsfinancial'] ? req.files['bidsfinancial'].map(file => file) : [];
  const bidstechnical = req.files['bidstechnical'] ? req.files['bidstechnical'].map(file => file) : []; // Handle presentation files
  const projectId = req.body.project_id;
  
  const formattedProjectName = `BDTour${project_name ? '_' + project_name : ''}`; // Update formatted project name
  const sql = `INSERT INTO BDTour (project_name, year) VALUES (?, ?)`;
  db.query(sql, [formattedProjectName, year], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      const projectId = result.insertId;
      const formattedProjectName = `BDTour${projectId}_${project_name}`;
  
      tendersight.forEach(tender => {
        const oldPath = tender.path;
        const extension = path.extname(tender.originalname);
        const newPath = path.join(__dirname, '..', 'uploads', 'BusinessDevelopment','BDTour', `BDTour${projectId}_${tender.originalname}`);
        fs.renameSync(oldPath, newPath);

        const insertTendersightQuery = `INSERT INTO BDTour_Tendersight (project_id, tendersight) VALUES (?, ?)`;
        db.query(insertTendersightQuery, [projectId, `BDTour${projectId}_${tender.originalname}`], (err, result) => {
          if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
          }
        });
      });

      tentativeletter.forEach(tentative => {
        const oldPath = tentative.path;
        const extension = path.extname(tentative.originalname);
        const newPath = path.join(__dirname, '..', 'uploads', 'BusinessDevelopment','BDTour', `BDTour${projectId}_${tentative.originalname}`);
        fs.renameSync(oldPath, newPath);

        const insertTentativeletterQuery = `INSERT INTO BDTour_Tentativeletter (project_id, tentativeletter) VALUES (?, ?)`;
        db.query(insertTentativeletterQuery, [projectId, `BDTour${projectId}_${tentative.originalname}`], (err, result) => {
          if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
          }
        });
      });
      bidsfinancial.forEach(finance => {
        const oldPath = finance.path;
        const extension = path.extname(finance.originalname);
        const newPath = path.join(__dirname, '..', 'uploads', 'BusinessDevelopment', 'BDTour',`BDTour${projectId}_${finance.originalname}`);
        fs.renameSync(oldPath, newPath);

        const insertBidsfinancialQuery = `INSERT INTO BDTour_Bidsfinancial (project_id, bidsfinancial) VALUES (?, ?)`;
        db.query(insertBidsfinancialQuery, [projectId, `BDTour${projectId}_${finance.originalname}`], (err, result) => {
          if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
          }
        });
      });
     
      bidstechnical.forEach(technical => {
        const oldPath = technical.path;
        const extension = path.extname(technical.originalname);
        const newPath = path.join(__dirname, '..', 'uploads', 'BusinessDevelopment', 'BDTour',`BDTour${projectId}_${technical.originalname}`);
        fs.renameSync(oldPath, newPath);
        
        const insertBidstechnicalQuery = `INSERT INTO BDTour_Bidstechnical (project_id, bidstechnical) VALUES (?, ?)`;
        db.query(insertBidstechnicalQuery, [projectId, `BDTour${projectId}_${technical.originalname}`], (err, result) => {
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
    db.query('SELECT t.project_id, t.project_name, t.year, s.tendersight, l.tentativeletter, f.bidsfinancial, bt.bidstechnical FROM BDTour t LEFT JOIN BDTour_Tendersight s ON t.project_id = s.project_id LEFT JOIN BDTour_Tentativeletter l ON t.project_id = l.project_id LEFT JOIN BDTour_Bidsfinancial f ON t.project_id = f.project_id LEFT JOIN BDTour_Bidstechnical bt ON t.project_id = bt.project_id ', (err, result) => {
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
  html += '<tr><th>Project ID</th><th>Project Name</th><th>Year</th><th>Tender Sight</th><th>Tentative Letters</th><th>Bids Financial</th><th>Bids Technical</th></tr>';

  const projectMap = new Map();

  projects.forEach((project, index) => {
    if (!projectMap.has(project.project_id)) {
      projectMap.set(project.project_id, { tendersight: [], tentativeletter: [], bidsfinancial: [], bidstechnical: [] });
    }
    const projectData = projectMap.get(project.project_id);
    if (project.tendersight) {
      projectData.tendersight.push(project.tendersight);
    }
    if (project.tentativeletter) {
      projectData.tentativeletter.push(project.tentativeletter);
    }
    if (project.bidsfinancial) {
      projectData.bidsfinancial.push(project.bidsfinancial);
    }
    if(project.bidstechnical){
      projectData.bidstechnical.push(project.bidstechnical);
    }
  });

  projectMap.forEach((projectData, projectId) => {
    
    const project = projects.find(p => p.project_id === projectId);
    html += `<tr>`;
    html += `<td>${projectId}</td>`; // Display the project ID
    html += `<td>${project.project_name}</td>`;
    html += `<td>${project.year}</td>`;
    html += `<td>${projectData.tendersight.join(', ')}</td>`; // Display photographs
    html += `<td>${projectData.tentativeletter.join(', ')}</td>`; // Display documentation
    html += `<td>${projectData.bidsfinancial.join(', ')}</td>`; // Display report
    html += `<td>${projectData.bidstechnical.join(', ')}</td>`;
    html += `</tr>`;
  });

  html += '</table></div>';
  return html;
}


router.get('/get-image/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '..', 'uploads', 'BusinessDevelopment','BDTour', filename);

  res.sendFile(filePath);
});

router.get('/display', (req, res) => {
  const projectId = req.query.projectId;
  db.query('SELECT * FROM BDTour WHERE project_id = ?', [projectId], (err, result) => {
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
        htmlContent += `<p><strong>Tender Sight:</strong> <a href="/BDTour/display_tendersight?projectId=${project.project_id}" target="_blank">View Tender Sight</a></p>`;
        htmlContent += `<p><strong>Tentative Letter:</strong> <a href="/BDTour/display_tentativeletter?projectId=${project.project_id}"target="_blank">View Tentative Letters</a></p>`;
        htmlContent += `<p><strong>Bids Financial:</strong> <a href="/BDTour/display_bidsfinancial?projectId=${project.project_id}"target="_blank">View Bids Financial Report </a></p>`;
        htmlContent += `<p><strong>Bids Technical:</strong> <a href="/BDTour/display_bidstechnical?projectId=${project.project_id}"target="_blank">View Bids Technical Report</a></p>`;
        res.send(htmlContent);
      } else {
        res.status(404).json({ message: 'Project not found' });
      }
    }
  });
});

router.get('/search', (req, res) => {
  const searchInput = req.query.searchInput;
  db.query('SELECT * FROM BDTour WHERE project_id = ? OR project_name = ?', [searchInput, searchInput], (err, result) => {
    if (err) {
      console.error('Error searching project:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      if (result.length > 0) {
        const projectId = result[0].project_id;
        res.status(200).json({ projectId });
      } else {
        res.status(404).json({ message: 'Project not found' });
      }
    }
  });
});

router.get('/display_tendersight', (req, res) => {
  const projectId = req.query.projectId;

  db.query('SELECT tendersight FROM BDTour_Tendersight WHERE project_id = ?', [projectId], (err, result) => {
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

  db.query('SELECT tentativeletter FROM BDTour_Tentativeletter WHERE project_id = ?', [projectId], (err, result) => {
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

  db.query('SELECT bidsfinancial FROM BDTour_Bidsfinancial WHERE project_id = ?', [projectId], (err, result) => {
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
    db.query('SELECT bidstechnical FROM BDTour_Bidstechnical WHERE project_id = ?', [projectId], (err, result) => {
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
        html += `<p><a href="/BDTour/get-image/${tendersight}" target="_blank">${tendersight}</a></p>`;
    });
    return html;
}

function generateTentativeletterHTML(tentativeletter) {
    let html = '<h2>Tentative Letter</h2>';
    tentativeletter.forEach(tentativeletter => {
        html += `<p><a href="/BDTour/get-image/${tentativeletter}" target="_blank">${tentativeletter}</a></p>`;
    });
    return html;
}

function generateBidsfinancialHTML(bidsfinancial) {
    let html = '<h2>Bids Financial</h2>';
    bidsfinancial.forEach(bidsfinancial => {
        html += `<p><a href="/BDTour/get-image/${bidsfinancial}" target="_blank">${bidsfinancial}</a></p>`;
    });
    return html;
}

function generateBidstechnicalHTML(bidstechnical) {
    let html = '<h2>Bids Technical</h2>';
    bidstechnical.forEach(bidstechnical => {
        html += `<p><a href="/BDTour/get-image/${bidstechnical}" target="_blank">${bidstechnical}</a></p>`;
    });
    return html;
}


router.get('/delete', (req, res) => {
  const searchInput = req.query.searchInput;
  db.query('SELECT * FROM BDTour WHERE project_id = ? OR project_name = ?', [searchInput, searchInput], (err, result) => {
      if (err) {
          console.error('Error checking project existence:', err);
          res.status(500).json({ error: 'Internal Server Error' });
      } else {
          if (result.length === 0) {
              res.status(404).json({ message: 'Project not found' });
          } else {
              const projectId = result[0].project_id;
              db.query('DELETE FROM BDTour_Tendersight WHERE project_id = ?', [projectId], (err, result) => {
                  if (err) {
                      console.error('Error deleting tendersight:', err);
                      res.status(500).json({ error: 'Internal Server Error' });
                  } else {
                      db.query('DELETE FROM BDTour_Tentativeletter WHERE project_id = ?', [projectId], (err, result) => {
                          if (err) {
                              console.error('Error deleting tentativeletter:', err);
                              res.status(500).json({ error: 'Internal Server Error' });
                          } else {
                              db.query('DELETE FROM BDTour_Bidsfinancial WHERE project_id = ?', [projectId], (err, result) => {
                                  if (err) {
                                      console.error('Error deleting bidsfinancial:', err);
                                      res.status(500).json({ error: 'Internal Server Error' });
                                  } else {
                                      db.query('DELETE FROM BDTour_Bidstechnical WHERE project_id = ?', [projectId], (err, result) => {
                                          if (err) {
                                              console.error('Error deleting bidstechnical:', err);
                                              res.status(500).json({ error: 'Internal Server Error' });
                                          } else {
                                              db.query('DELETE FROM BDTour WHERE project_id = ?', [projectId], (err, result) => {
                                                  if (err) {
                                                      console.error('Error deleting project:', err);
                                                      res.status(500).json({ error: 'Internal Server Error' });
                                                  } else {
                                                      res.status(200).json({ message: 'Project deleted' });
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
  { name: 'tendersight', maxCount: 10 },
  { name: 'tentativeletter', maxCount: 10 },
  { name: 'bidsfinancial', maxCount:10},
  { name: 'bidstechnical', maxCount: 10 }
]), (req, res) => {
const projectId = req.body.project_id;
const tendersight = req.files['tendersight'] ? req.files['tendersight'] : [];
const tentativeletter = req.files['tentativeletter'] ? req.files['tentativeletter'] : [];
const bidsfinancial = req.files['bidsfinancial'] ? req.files['bidsfinancial'] : [];
const bidstechnical = req.files['bidstechnical'] ? req.files['bidstechnical'] : [];

 const generateNewFilename = (projectId, originalFilename) => {
  const extension = path.extname(originalFilename);
  const filenameWithoutExtension = path.basename(originalFilename, extension);
  return `BDTour${projectId}_${filenameWithoutExtension}${extension}`;
};
 tendersight.forEach(tender => {
  const oldPath = tender.path;
  const newPath = path.join(__dirname, '..', 'uploads','BusinessDevelopment' ,'BDTour', generateNewFilename(projectId, tender.originalname));
  fs.renameSync(oldPath, newPath);
  const newFilename = generateNewFilename(projectId, tender.originalname);

  db.query(`INSERT INTO BDTour_Tendersight (project_id, tendersight) VALUES (?, ?)`, [projectId, newFilename], (err) => {
    if (err) {
      console.error('Error updating tendersight:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });
});

tentativeletter.forEach(tentative => {
  const oldPath = tentative.path;
  const newPath = path.join(__dirname, '..', 'uploads', 'BusinessDevelopment' ,'BDTour',generateNewFilename(projectId, tentative.originalname));
  fs.renameSync(oldPath, newPath);
  const newFilename = generateNewFilename(projectId, tentative.originalname);

  db.query(`INSERT INTO BDTour_Tentativeletter (project_id, tentativeletter) VALUES (?, ?)`, [projectId, newFilename], (err) => {
    if (err) {
      console.error('Error updating tentativeletter:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });
});

bidsfinancial.forEach(bid => {
  const oldPath = bid.path;
  const newPath = path.join(__dirname, '..', 'uploads', 'BusinessDevelopment' ,'BDTour',generateNewFilename(projectId, bid.originalname));
  fs.renameSync(oldPath, newPath);
  const newFilename = generateNewFilename(projectId, bid.originalname);
  db.query(`INSERT INTO BDTour_Bidsfinancial (project_id, bidsfinancial) VALUES (?, ?)`, [projectId, newFilename], (err) => {
    if (err) {
      console.error('Error updating bidsfinancial:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });
});

bidstechnical.forEach(bid => {
  const oldPath = bid.path;
  const newPath = path.join(__dirname, '..', 'uploads', 'BusinessDevelopment' ,'BDTour',generateNewFilename(projectId, bid.originalname));
  fs.renameSync(oldPath, newPath);
  const newFilename = generateNewFilename(projectId, bid.originalname);
  db.query(`INSERT INTO BDTour_Bidstechnical (project_id, bidstechnical) VALUES (?, ?)`, [projectId, newFilename], (err) => {
    if (err) {
      console.error('Error updating bidstechnical:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });
});

res.status(200).json({ message: 'Files are updated successfully' });
});

module.exports = router;


