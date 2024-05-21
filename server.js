// server.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql');
const cors = require('cors');
const session = require('express-session');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 11198;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

function generateRandomString(length) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
}

const secretKey = generateRandomString(32);

app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true
}));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'fortressdb'
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Require the management routes
app.use(require('./routes/managementRoutes'));
app.use(require('./routes/verticalsRoutes'));
app.use(require('./routes/teamleaderRoutes'));
app.use(require('./routes/employeeRoutes'));
app.use(require('./routes/userManagementRoutes'));
app.use(require('./routes/userVerticalsRoutes'));
app.use(require('./routes/userTeamleaderRoutes'));
app.use(require('./routes/userEmployeeRoutes'));
app.use(require('./routes/refloginRoutes'));

// Require the transportation search in management route
const managementSearchRoutes = require('./routes/managementsearchRoutes');
app.use('/managementsearch', managementSearchRoutes);

const managementenvironmentRoutes=require('./routes/managementenvironmentRoutes');
app.use('/managementenvironment', managementenvironmentRoutes);

const managementtourismRoutes = require('./routes/managementtourismRoutes');
app.use('/managementtourism',managementtourismRoutes);

const manaindustrialRoutes = require('./routes/manaindustrialRoutes');
app.use('/manaindustrial',manaindustrialRoutes);

const manaurbanRoutes = require('./routes/manaurbanRoutes');
app.use('/manaurban',manaurbanRoutes);

const BDtransmanagementRoutes = require('./routes/BDtransmanagementRoutes');
app.use('/BDtransmanagement', BDtransmanagementRoutes);

const BDenvmanagementRoutes = require('./routes/BDenvmanagementRoutes');
app.use('/BDenvmanagement', BDenvmanagementRoutes);

const BDtourmanagementRoutes = require('./routes/BDtourmanagementRoutes');
app.use('/BDtourmanagement',BDtourmanagementRoutes);

const BDindmanagementRoutes = require('./routes/BDindmanagementRoutes');
app.use('/BDindmanagement', BDindmanagementRoutes);

const BDurbanmanagementRoutes = require('./routes/BDurbanmanagementRoutes');
app.use('/BDurbanmanagement', BDurbanmanagementRoutes);

const BDtransverticalsRoutes = require('./routes/BDtransverticalsRoutes');
app.use('/BDtransverticals', BDtransverticalsRoutes);

const BDenvverticalsRoutes = require('./routes/BDenvverticalsRoutes');
app.use('/BDenvverticals', BDenvverticalsRoutes);

const BDtourverticalsRoutes = require('./routes/BDtourverticalsRoutes');
app.use('/BDtourverticals',BDtourverticalsRoutes);
const BDindverticalsRoutes = require('./routes/BDindverticalsRoutes');
app.use('/BDindverticals', BDindverticalsRoutes);

const BDurbanverticalsRoutes = require('./routes/BDurbanverticalsRoutes');
app.use('/BDurbanverticals', BDurbanverticalsRoutes);

const TltransRoutes = require('./routes/TltransRoutes');
app.use('/Tltrans', TltransRoutes);

const TlenvRoutes = require('./routes/TlenvRoutes');
app.use('/Tlenv', TlenvRoutes);

const TltourRoutes = require('./routes/TltourRoutes');
app.use('/Tltour', TltourRoutes);

const TlindRoutes = require('./routes/TlindRoutes');
app.use('/Tlind',TlindRoutes);

const TlurbanRoutes = require('./routes/TlurbanRoutes');
app.use('/Tlurban',TlurbanRoutes);

const EmptransRoutes= require('./routes/EmptransRoutes');
app.use('/Emptrans',EmptransRoutes);

const EmpenvRoutes= require('./routes/EmpenvRoutes');
app.use('/Empenv',EmpenvRoutes);

const EmptourRoutes= require('./routes/EmptourRoutes');
app.use('/Emptour',EmptourRoutes);

const EmpindRoutes= require('./routes/EmpindRoutes');
 app.use('/Empind',EmpindRoutes);

const EmpurbanRoutes= require('./routes/EmpurbanRoutes');
app.use('/Empurban',EmpurbanRoutes);


const HRcurrentRoutes= require('./routes/HRcurrentRoutes');
app.use('/HRcurrent',HRcurrentRoutes);

const HRpreviousRoutes= require('./routes/HRpreviousRoutes');
app.use('/HRprevious',HRpreviousRoutes);

const HRcurrentsearchRoutes= require('./routes/HRcurrentsearchRoutes');
app.use('/HRcurrentsearch',HRcurrentsearchRoutes);

const HRprevioussearchRoutes= require('./routes/HRprevioussearchRoutes');
app.use('/HRprevioussearch',HRprevioussearchRoutes);

const othertransportRoutes= require('./routes/othertransportRoutes');
app.use('/othertransport',othertransportRoutes);

const otherenvironmentRoutes= require('./routes/otherenvironmentRoutes');
app.use('/otherenvironment',otherenvironmentRoutes);

const otherindustrialRoutes= require('./routes/otherindustrialRoutes');
app.use('/otherindustrial',otherindustrialRoutes);

const othertourismRoutes= require('./routes/othertourismRoutes');
app.use('/othertourism',othertourismRoutes);

const otherurbaninfraRoutes= require('./routes/otherurbaninfraRoutes');
app.use('/otherurbaninfra',otherurbaninfraRoutes);

const standtransportRoutes= require('./routes/standtransportRoutes');
app.use('/standtransport',standtransportRoutes);

const standenvRoutes= require('./routes/standenvRoutes');
app.use('/standenv',standenvRoutes);

const standindRoutes=require('./routes/standindRoutes');
app.use ('/standind', standindRoutes);

const standtourRoutes= require('./routes/standtourRoutes');
app.use('/standtour', standtourRoutes);

const standurbanRoutes= require('./routes/standurbanRoutes');
app.use('/standurban', standurbanRoutes);


const othertransportsearchRoutes= require('./routes/othertransportsearchRoutes');
app.use('/othertransportsearch', othertransportsearchRoutes);

const otherenvironmentsearchRoutes= require('./routes/otherenvironmentsearchRoutes');
app.use('/otherenvironmentsearch', otherenvironmentsearchRoutes);

const othertourismsearchRoutes= require('./routes/othertourismsearchRoutes');
app.use('/othertourismsearch', othertourismsearchRoutes);

const otherindustrialsearchRoutes= require('./routes/otherindustrialsearchRoutes');
app.use('/otherindustrialsearch', otherindustrialsearchRoutes);

const otherurbansearchRoutes= require('./routes/otherurbansearchRoutes');
app.use('/otherurbansearch', otherurbansearchRoutes);

const standardtransportsearchRoutes= require('./routes/standardtransportsearchRoutes');
app.use('/standardtransportsearch', standardtransportsearchRoutes);

const standardenvironmentsearchRoutes= require('./routes/standardenvironmentsearchRoutes'); 
app.use('/standardenvironmentsearch', standardenvironmentsearchRoutes)

const standardindustrialsearchRoutes= require('./routes/standardindustrialsearchRoutes'); 
app.use('/standardindustrialsearch', standardindustrialsearchRoutes);

const standardtourismsearchRoutes= require('./routes/standardtourismsearchRoutes');
app.use('/standardtourismsearch', standardtourismsearchRoutes);

const standardurbansearchRoutes= require('./routes/standardurbansearchRoutes');
app.use('/standardurbansearch', standardurbansearchRoutes); 









// Require the transportation route
const transportationRoutes = require('./routes/transportationRoutes');
app.use('/transportation', transportationRoutes);

// Require other routes (environmental, tourism, industrial, urbaninfra)
const environmentalRoutes = require('./routes/environmentalRoutes');
app.use('/environmental', environmentalRoutes);

const industrialRoutes = require('./routes/industrialRoutes');
app.use('/industrial', industrialRoutes);

const tourismRoutes = require('./routes/tourismRoutes');
app.use('/tourism', tourismRoutes);

const urbaninfraRoutes = require('./routes/urbaninfraRoutes');
app.use('/urbaninfra', urbaninfraRoutes);

const bdtransportRoutes = require('./routes/bdtransportRoutes');
app.use('/bdtransport', bdtransportRoutes);

const bdenvRoutes = require('./routes/bdenvRoutes');
app.use('/bdenv',bdenvRoutes);

const bdtourRoutes = require('./routes/bdtourRoutes');
app.use('/bdtour',bdtourRoutes);

const bdurbanRoutes = require('./routes/bdurbanRoutes');
app.use('/bdurban',bdurbanRoutes);

const bdindRoutes = require('./routes/bdindRoutes');
app.use('/bdind',bdindRoutes);




// Serve main.html for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
