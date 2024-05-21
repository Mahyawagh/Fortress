// //HRcurrentRoutes.js
// const express = require('express');
// const multer = require('multer');
// const mysql = require('mysql');
// const path = require('path');
// const fs = require('fs');

// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '1234',
//   database: 'fortressdb'
// });

// db.connect(err => {
//   if (err) throw err;
//   console.log('MySQL Connected');
  
 
//   const createTableQuery = `CREATE TABLE IF NOT EXISTS HRcurrent (
//     emp_id INT AUTO_INCREMENT PRIMARY KEY,
//     Employee_name VARCHAR(255),
//     year INT
//   )`;
//   db.query(createTableQuery, err => {
//     if (err) throw err;
//     console.log('Transport table created');
//   });

//   const createEmpDocumentationTableQuery = `CREATE TABLE IF NOT EXISTS Current_Documentation (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     emp_id INT,
//     Documentation BLOB,
//     FOREIGN KEY (emp_id) REFERENCES HRcurrent(emp_id)
//   )`;
//   db.query(createEmpDocumentationTableQuery, err => {
//     if (err) throw err;
//     console.log('Current_Documentation table created');
//   });
// });

// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//       cb(null, 'uploads/Humanresource/CurrentEmployee');
//     },
//     filename: function(req, file, cb) {
//       const empId = req.body.emp_id; 
//       const originalname = file.originalname; // Get original filename
//       const extension = path.extname(originalname); // Get file extension
//       const modifiedFilename = `Emp${empId}_${Date.now()}_${file.fieldname}${extension}`; // Generate modified filename
//       //console.log('Modified Filename:', modifiedFilename); // Add this line to log the modified filename
  
//       cb(null, modifiedFilename); // Call the callback with the modified filename
//     }
//   });
//   const upload = multer({ storage: storage });
  
//   const router = express.Router();
  
//   router.use('/uploads', express.static(path.join(__dirname, '..', 'uploads', 'Humanresource','CurrentEmployee')));
  
//   router.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'Humanresource', 'current_employee.html'));
//   });

//   router.post('/upload', upload.fields([
//   { name: 'documentation', maxCount: 10 }
   
// ]), (req, res) => {
//     const { employee_name, year } = req.body;
//     const documentation =req.files['documentation'] ? req.files['documentation'].map(file => file) : [];

//     const formattedEmployeeName = `Emp${employee_name ? '_' + employee_name : ''}`; 
//   const sql = `INSERT INTO HRcurrent (employee_name, year) VALUES (?, ?)`;
//   db.query(sql, [formattedEmployeeName, year], (err, result) => {
//     if (err) {
//       console.error(err);
//       res.status(500).json({ error: 'Internal Server Error' });
//     } else {
//       const empId = result.insertId;
//       const formattedEmployeeName = `Emp${empId}_${employee_name}`;

//       documentation.forEach(doc => {
//         const oldPath = doc.path;
//         const extension = path.extname(doc.originalname);
//         const newPath = path.join(__dirname, '..', 'uploads', 'Humanresource','CurrentEmployee', `Emp${empId}_${doc.originalname}`);
//         fs.renameSync(oldPath, newPath);

//         // Insert documentation file name into Trans_Documentation table
//         const insertDocumentationQuery = `INSERT INTO Current_Documentation (emp_id, documentation) VALUES (?, ?)`;
//         db.query(insertDocumentationQuery, [empId, `Emp${empId}_${doc.originalname}`], (err, result) => {
//           if (err) {
//             console.error(err);
//             res.status(500).json({ error: 'Internal Server Error' });
//           }
//         });
//       });
//       res.status(200).json({ message: 'Files uploaded and project inserted successfully' });
//     }
//   });
// });

// router.get('/projectsHTML', (req, res) => {
//     db.query('SELECT c.emp_id, c.employee_name, c.year, d.documentation FROM HRcurrent c LEFT JOIN Current_Documentation d ON c.emp_id = d.emp_id ', (err, result) => {
//       if (err) {
//         console.error('Error fetching projects:', err);
//         res.status(500).json({ error: 'Internal Server Error' });
//       } else {
//         const projects = result;
//         const html = generateProjectsHTML(projects);
//         res.send(html);
//       }
//     });
//   });

//   function generateProjectsHTML(projects) {
//     let html = '<h2>Projects Details</h2>';
//     html += '<div style="overflow-x:auto;">'; // Add horizontal scrolling
//     html += '<table border="1">';
//     html += '<tr><th>Emp ID</th><th>Employee Name</th><th>Year</th><th>Documentation</th></tr>';
//     const projectMap = new Map();

//     projects.forEach((project, index) => {
//       if (!projectMap.has(project.emp_id)) {
//         projectMap.set(project.emp_id, {  documentation: [] });
//       }
//       const projectData = projectMap.get(project.emp_id);
      
//       if (project.documentation) {
//         projectData.documentation.push(project.documentation);
//       }
//   });
//     // Generate rows for each project
//   projectMap.forEach((projectData, empId) => {
    
//     const project = projects.find(p => p.emp_id === empId);
//     html += `<tr>`;
//     html += `<td>${empId}</td>`; 
//     html += `<td>${project.employee_name}</td>`;
//     html += `<td>${project.year}</td>`;
//     html += `<td>${projectData.documentation.join(', ')}</td>`;
    
// });

// html += '</table></div>';
// return html;
// }

// router.get('/get-image/:filename', (req, res) => {
//     const filename = req.params.filename;
//     const filePath = path.join(__dirname, '..', 'uploads', 'Humanresource','CurrentEmployee', filename);
  
//     res.sendFile(filePath);
//   });
  
//   router.get('/display', (req, res) => {
//     const empId = req.query.empId;
//     db.query('SELECT * FROM HRcurrent WHERE emp_id = ?', [empId], (err, result) => {
//       if (err) {
//         console.error('Error fetching Employee details:', err);
//         res.status(500).json({ error: 'Internal Server Error' });
//       } else {
//         if (result.length > 0) {
//           const project = result[0];
//           let htmlContent = `<h2>Empoyee Details</h2>`;
//           htmlContent += `<p><strong>Emp ID:</strong> ${project.emp_id}</p>`;
//           htmlContent += `<p><strong>Emp Name:</strong> ${project.employee_name}</p>`;
//           htmlContent += `<p><strong>Year:</strong> ${project.year}</p>`;
//           htmlContent += `<p><strong>Documentation:</strong> <a href="/hrcurrent/display_documentation?empId=${project.emp_id}" target="_blank">View Documentation</a></p>`;
//           res.send(htmlContent);
//         } else {
//           res.status(404).json({ message: 'Employee not found' });
//         }
//       }
//     });
//   });

//   router.get('/search', (req, res) => {
//     const searchInput = req.query.searchInput;
//     db.query('SELECT * FROM HRcurrent WHERE emp_id = ? OR employee_name = ?', [searchInput, searchInput], (err, result) => {
//       if (err) {
//         console.error('Error searching project:', err);
//         res.status(500).json({ error: 'Internal Server Error' });
//       } else {
//         if (result.length > 0) {
//           // If project found, send JSON response with project details
//           const empId = result[0].emp_id;
//           res.status(200).json({ empId });
//         } else {
//           // If project not found, send JSON response with 404 status code
//           res.status(404).json({ message: 'employee not found' });
//         }
//       }
//     });
//   });

  
// router.get('/display_documentation', (req, res) => {
//     const empId = req.query.empId;
  
//     db.query('SELECT documentation FROM Current_Documentation WHERE emp_id = ?', [empId], (err, result) => {
//       if (err) {
//         console.error('Error fetching documentation:', err);
//         return res.status(500).json({ error: 'Internal Server Error' });
//       }
  
//       if (result.length === 0) {
//         console.error('Documentation not found for project ID:', empId);
//         return res.status(404).json({ message: 'Documentation not found' });
//       }
  
//       const documentation = result.map(row => row.documentation);
//       const htmlContent = generateDocumentationHTML(documentation);
//       res.send(htmlContent);
//     });
//   });

//   function generateDocumentationHTML(documentation) {
//     let html = '<h2>Documentation</h2>';
//     documentation.forEach(doc => {
//       html += `<p><a href="/hrcurrent/get-image/${doc}" target="_blank">${doc}</a></p>`;
//     });
//     return html;
//   }

  
// module.exports = router;


// const express = require('express');
// const multer = require('multer');
// const mysql = require('mysql');
// const path = require('path');
// const fs = require('fs');

// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '1234',
//   database: 'fortressdb'
// });

// db.connect(err => {
//   if (err) throw err;
//   console.log('MySQL Connected');
  
//   const createTableQuery = `CREATE TABLE IF NOT EXISTS HRcurrent (
//     emp_id INT AUTO_INCREMENT PRIMARY KEY,
//     Employee_name VARCHAR(255),
//     year INT
//   )`;
//   db.query(createTableQuery, err => {
//     if (err) throw err;
//     console.log('Transport table created');
//   });

//   const createEmpDocumentationTableQuery = `CREATE TABLE IF NOT EXISTS Current_Documentation (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     emp_id INT,
//     Documentation BLOB,
//     FOREIGN KEY (emp_id) REFERENCES HRcurrent(emp_id)
//   )`;
//   db.query(createEmpDocumentationTableQuery, err => {
//     if (err) throw err;
//     console.log('Current_Documentation table created');
//   });
// });

// const storage = multer.diskStorage({
//   destination: function(req, file, cb) {
//     cb(null, 'uploads/Humanresource/CurrentEmployee');
//   },
//   filename: function(req, file, cb) {
//     const empId = req.body.emp_id; 
//     const originalname = file.originalname; // Get original filename
//     const extension = path.extname(originalname); // Get file extension
//     const modifiedFilename = `Emp${empId}_${Date.now()}_${file.fieldname}${extension}`; // Generate modified filename
//     //console.log('Modified Filename:', modifiedFilename); // Add this line to log the modified filename

//     cb(null, modifiedFilename); // Call the callback with the modified filename
//   }
// });
// const upload = multer({ storage: storage });

// const router = express.Router();

// router.use('/uploads', express.static(path.join(__dirname, '..', 'uploads', 'Humanresource','CurrentEmployee')));

// router.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'Humanresource', 'current_employee.html'));
// });

// router.post('/upload', upload.fields([
//   { name: 'documentation', maxCount: 10 }
// ]), (req, res) => {
//   const { employee_name, year } = req.body;
//   const documentation = req.files['documentation'] ? req.files['documentation'].map(file => file) : [];

//   const formattedEmployeeName = employee_name ? `Emp_${employee_name}` : ''; 
//   const sql = `INSERT INTO HRcurrent (Employee_name, year) VALUES (?, ?)`;
//   db.query(sql, [formattedEmployeeName, year], (err, result) => {
//     if (err) {
//       console.error(err);
//       res.status(500).json({ error: 'Internal Server Error' });
//     } else {
//       const empId = result.insertId;

//       documentation.forEach(doc => {
//         const oldPath = doc.path;
//         const extension = path.extname(doc.originalname);
//         const newPath = path.join(__dirname, '..', 'uploads', 'Humanresource','CurrentEmployee', `Emp${empId}_${doc.originalname}`);
//         fs.renameSync(oldPath, newPath);

//         // Insert documentation file name into Trans_Documentation table
//         const insertDocumentationQuery = `INSERT INTO Current_Documentation (emp_id, Documentation) VALUES (?, ?)`;
//         db.query(insertDocumentationQuery, [empId, `Emp${empId}_${doc.originalname}`], (err, result) => {
//           if (err) {
//             console.error(err);
//             res.status(500).json({ error: 'Internal Server Error' });
//           }
//         });
//       });
//       res.status(200).json({ message: 'Files uploaded and project inserted successfully' });
//     }
//   });
// });

// router.get('/projectsHTML', (req, res) => {
//   db.query('SELECT c.emp_id, c.Employee_name, c.year, d.Documentation FROM HRcurrent c LEFT JOIN Current_Documentation d ON c.emp_id = d.emp_id ', (err, result) => {
//     if (err) {
//       console.error('Error fetching projects:', err);
//       res.status(500).json({ error: 'Internal Server Error' });
//     } else {
//       const projects = result;
//       const html = generateProjectsHTML(projects);
//       res.send(html);
//     }
//   });
// });

// function generateProjectsHTML(projects) {
//   let html = '<h2>Projects Details</h2>';
//   html += '<div style="overflow-x:auto;">'; // Add horizontal scrolling
//   html += '<table border="1">';
//   html += '<tr><th>Emp ID</th><th>Employee Name</th><th>Year</th><th>Documentation</th></tr>';
//   const projectMap = new Map();

//   projects.forEach((project, index) => {
//     if (!projectMap.has(project.emp_id)) {
//       projectMap.set(project.emp_id, {  documentation: [] });
//     }
//     const projectData = projectMap.get(project.emp_id);
    
//     if (project.Documentation) {
//       projectData.documentation.push(project.Documentation);
//     }
//   });
//   // Generate rows for each project
//   projectMap.forEach((projectData, empId) => {
  
//     const project = projects.find(p => p.emp_id === empId);
//     html += `<tr>`;
//     html += `<td>${empId}</td>`; 
//     html += `<td>${project.Employee_name}</td>`;
//     html += `<td>${project.year}</td>`;
//     html += `<td>${projectData.documentation.join(', ')}</td>`;
    
//   });

//   html += '</table></div>';
//   return html;
// }

// router.get('/get-image/:filename', (req, res) => {
//   const filename = req.params.filename;
//   const filePath = path.join(__dirname, '..', 'uploads', 'Humanresource','CurrentEmployee', filename);

//   res.sendFile(filePath);
// });

// router.get('/display', (req, res) => {
//   const empId = req.query.empId;
//   db.query('SELECT * FROM HRcurrent WHERE emp_id = ?', [empId], (err, result) => {
//     if (err) {
//       console.error('Error fetching Employee details:', err);
//       res.status(500).json({ error: 'Internal Server Error' });
//     } else {
//       if (result.length > 0) {
//         const project = result[0];
//         let htmlContent = `<h2>Employee Details</h2>`;
//         htmlContent += `<p><strong>Emp ID:</strong> ${project.emp_id}</p>`;
//         htmlContent += `<p><strong>Emp Name:</strong> ${project.Employee_name}</p>`;
//         htmlContent += `<p><strong>Year:</strong> ${project.year}</p>`;
//         htmlContent += `<p><strong>Documentation:</strong> <a href="/hrcurrent/display_documentation?empId=${project.emp_id}" target="_blank">View Documentation</a></p>`;
//         res.send(htmlContent);
//       } else {
//         res.status(404).json({ message: 'Employee not found' });
//       }
//     }
//   });
// });

// router.get('/search', (req, res) => {
//   const searchInput = req.query.searchInput;
//   db.query('SELECT * FROM HRcurrent WHERE emp_id = ? OR Employee_name = ?', [searchInput, searchInput], (err, result) => {
//     if (err) {
//       console.error('Error searching project:', err);
//       res.status(500).json({ error: 'Internal Server Error' });
//     } else {
//       if (result.length > 0) {
//         // If project found, send JSON response with project details
//         const empId = result[0].emp_id;
//         res.status(200).json({ empId });
//       } else {
//         // If project not found, send JSON response with 404 status code
//         res.status(404).json({ message: 'Employee not found' });
//       }
//     }
//   });
// });

// router.get('/display_documentation', (req, res) => {
//   const empId = req.query.empId;

//   db.query('SELECT Documentation FROM Current_Documentation WHERE emp_id = ?', [empId], (err, result) => {
//     if (err) {
//       console.error('Error fetching documentation:', err);
//       return res.status(500).json({ error: 'Internal Server Error' });
//     }

//     if (result.length === 0) {
//       console.error('Documentation not found for project ID:', empId);
//       return res.status(404).json({ message: 'Documentation not found' });
//     }

//     const documentation = result.map(row => row.Documentation);
//     const htmlContent = generateDocumentationHTML(documentation);
//     res.send(htmlContent);
//   });
// });

// function generateDocumentationHTML(documentation) {
//   let html = '<h2>Documentation</h2>';
//   documentation.forEach(doc => {
//     html += `<p><a href="/hrcurrent/get-image/${doc}" target="_blank">${doc}</a></p>`;
//   });
//   return html;
// }

// router.post("/delete", (req, res) => {
//   const searchInput = req.body.searchInput;

//   // First, check if the project exists
//   db.query(
//     "SELECT * FROM HRcurrent WHERE emp_id = ? OR Employee_name = ?",
//     [searchInput, searchInput],
//     (err, result) => {
//       if (err) {
//         console.error("Error checking project existence:", err);
//         return res.status(500).json({ error: "Internal Server Error" });
//       }

//       if (result.length === 0) {
//         return res.status(404).json({ message: "Employee not found" });
//       }

//       const empId = result[0].emp_id;

//       // Next, delete the documentation associated with the employee
//       db.query("DELETE FROM Current_Documentation WHERE emp_id = ?", [empId], (err, result) => {
//         if (err) {
//           console.error("Error deleting documentation:", err);
//           return res.status(500).json({ error: "Internal Server Error" });
//         }

//         // Finally, delete the employee record from HRcurrent table
//         db.query("DELETE FROM HRcurrent WHERE emp_id = ?", [empId], (err, result) => {
//           if (err) {
//             console.error("Error deleting employee record:", err);
//             return res.status(500).json({ error: "Internal Server Error" });
//           }

//           res.status(200).json({ message: "Employee record and documentation deleted successfully" });
//         });
//       });
//     }
//   );
// });

// module.exports = router;



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
  
  const createTableQuery = `CREATE TABLE IF NOT EXISTS HRcurrent (
    emp_id INT AUTO_INCREMENT PRIMARY KEY,
    Employee_name VARCHAR(255),
    year INT
  )`;
  db.query(createTableQuery, err => {
    if (err) throw err;
    console.log('Transport table created');
  });

  const createEmpDocumentationTableQuery = `CREATE TABLE IF NOT EXISTS Current_Documentation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emp_id INT,
    Documentation BLOB,
    FOREIGN KEY (emp_id) REFERENCES HRcurrent(emp_id)
  )`;
  db.query(createEmpDocumentationTableQuery, err => {
    if (err) throw err;
    console.log('Current_Documentation table created');
  });
});

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/Humanresource/CurrentEmployee');
  },
  filename: function(req, file, cb) {
    const empId = req.body.emp_id; 
    const originalname = file.originalname; // Get original filename
    const extension = path.extname(originalname); // Get file extension
    const modifiedFilename = `Emp${empId}_${Date.now()}_${file.fieldname}${extension}`; // Generate modified filename
    //console.log('Modified Filename:', modifiedFilename); // Add this line to log the modified filename

    cb(null, modifiedFilename); // Call the callback with the modified filename
  }
});
const upload = multer({ storage: storage });

const router = express.Router();

router.use('/uploads', express.static(path.join(__dirname, '..', 'uploads', 'Humanresource','CurrentEmployee')));

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Humanresource', 'current_employee.html'));
});

router.post('/upload', upload.fields([
  { name: 'documentation', maxCount: 10 }
]), (req, res) => {
  const { employee_name, year } = req.body;
  const documentation = req.files['documentation'] ? req.files['documentation'].map(file => file) : [];

  const formattedEmployeeName = employee_name ? `Emp_${employee_name}` : ''; 
  const sql = `INSERT INTO HRcurrent (Employee_name, year) VALUES (?, ?)`;
  db.query(sql, [formattedEmployeeName, year], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      const empId = result.insertId;

      documentation.forEach(doc => {
        const oldPath = doc.path;
        const extension = path.extname(doc.originalname);
        const newPath = path.join(__dirname, '..', 'uploads', 'Humanresource','CurrentEmployee', `Emp${empId}_${doc.originalname}`);
        fs.renameSync(oldPath, newPath);

        // Insert documentation file name into Trans_Documentation table
        const insertDocumentationQuery = `INSERT INTO Current_Documentation (emp_id, Documentation) VALUES (?, ?)`;
        db.query(insertDocumentationQuery, [empId, `Emp${empId}_${doc.originalname}`], (err, result) => {
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
  db.query('SELECT c.emp_id, c.Employee_name, c.year, d.Documentation FROM HRcurrent c LEFT JOIN Current_Documentation d ON c.emp_id = d.emp_id ', (err, result) => {
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
  html += '<tr><th>Emp ID</th><th>Employee Name</th><th>Year</th><th>Documentation</th></tr>';
  const projectMap = new Map();

  projects.forEach((project, index) => {
    if (!projectMap.has(project.emp_id)) {
      projectMap.set(project.emp_id, {  documentation: [] });
    }
    const projectData = projectMap.get(project.emp_id);
    
    if (project.Documentation) {
      projectData.documentation.push(project.Documentation);
    }
  });
  // Generate rows for each project
  projectMap.forEach((projectData, empId) => {
  
    const project = projects.find(p => p.emp_id === empId);
    html += `<tr>`;
    html += `<td>${empId}</td>`; 
    html += `<td>${project.Employee_name}</td>`;
    html += `<td>${project.year}</td>`;
    html += `<td>${projectData.documentation.join(', ')}</td>`;
    
  });

  html += '</table></div>';
  return html;
}

router.get('/get-image/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '..', 'uploads', 'Humanresource','CurrentEmployee', filename);

  res.sendFile(filePath);
});

router.get('/display', (req, res) => {
  const empId = req.query.empId;
  db.query('SELECT * FROM HRcurrent WHERE emp_id = ?', [empId], (err, result) => {
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
        htmlContent += `<p><strong>Documentation:</strong> <a href="/hrcurrent/display_documentation?empId=${project.emp_id}" target="_blank">View Documentation</a></p>`;
        res.send(htmlContent);
      } else {
        res.status(404).json({ message: 'Employee not found' });
      }
    }
  });
});

router.get('/search', (req, res) => {
  const searchInput = req.query.searchInput;
  db.query('SELECT * FROM HRcurrent WHERE emp_id = ? OR Employee_name = ?', [searchInput, searchInput], (err, result) => {
    if (err) {
      console.error('Error searching project:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      if (result.length > 0) {
        // If project found, send JSON response with project details
        const empId = result[0].emp_id;
        res.status(200).json({ empId });
      } else {
        // If project not found, send JSON response with 404 status code
        res.status(404).json({ message: 'Employee not found' });
      }
    }
  });
});

router.get('/display_documentation', (req, res) => {
  const empId = req.query.empId;

  db.query('SELECT Documentation FROM Current_Documentation WHERE emp_id = ?', [empId], (err, result) => {
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
    html += `<p><a href="/hrcurrent/get-image/${doc}" target="_blank">${doc}</a></p>`;
  });
  return html;
}



router.post("/delete", (req, res) => {
  const searchInput = req.body.searchInput;

  // First, check if the project exists
  db.query(
    "SELECT * FROM HRcurrent WHERE emp_id = ? OR Employee_name = ?",
    [searchInput, searchInput],
    (err, result) => {
      if (err) {
        console.error("Error checking project existence:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const empId = result[0].emp_id;

      // Next, delete the documentation associated with the employee
      db.query("DELETE FROM Current_Documentation WHERE emp_id = ?", [empId], (err, result) => {
        if (err) {
          console.error("Error deleting documentation:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        // Finally, delete the employee record from HRcurrent table
        db.query("DELETE FROM HRcurrent WHERE emp_id = ?", [empId], (err, result) => {
          if (err) {
            console.error("Error deleting employee record:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          res.status(200).json({ message: "Employee record and documentation deleted successfully" });
        });
      });
    }
  );
});
const update = multer({ storage: storage }); // Update storage configuration if needed

router.post('/update', update.fields([
  { name: 'newDocumentation', maxCount: 10 }
]), (req, res) => {
  const { empId } = req.body;
  const newDocumentation = req.files['newDocumentation'] ? req.files['newDocumentation'].map(file => file) : [];

  // Check if employee exists
  db.query('SELECT * FROM HRcurrent WHERE emp_id = ? OR Employee_name = ?', [empId, empId], (err, result) => {
    if (err) {
      console.error('Error checking employee existence:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const empId = result[0].emp_id;

    // Insert new documentation files
    newDocumentation.forEach(doc => {
      const oldPath = doc.path;
      const extension = path.extname(doc.originalname);
      const newPath = path.join(__dirname, '..', 'uploads', 'Humanresource','CurrentEmployee', `Emp${empId}_${doc.originalname}`);
      fs.renameSync(oldPath, newPath);

      // Insert new documentation file name into Current_Documentation table
      const insertDocumentationQuery = `INSERT INTO Current_Documentation (emp_id, Documentation) VALUES (?, ?)`;
      db.query(insertDocumentationQuery, [empId, `Emp${empId}_${doc.originalname}`], (err, result) => {
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