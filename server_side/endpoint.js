const express = require('express');
const cors = require("cors");
const multer = require('multer');

const db = require('./db');

const port = 4440;

const app = express();
app.use(cors());
app.use(cors({
    origin: 'http://localhost:3000',  // Allow requests from the React app
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }))
app.use(express.json());  // Add this line to parse JSON payloads



// Set up multer storage configuration (you can specify where to store the file, e.g., 'uploads/' folder)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    },
  });
  
  // Set up multer instance with the storage configuration
  const upload = multer({ storage: storage });




app.get('/debug', (req,res) => {
    db.execute(
        `SELECT * FROM UserCompanyInfo`, (err, results) => {
        if (err)
            res.json({message:"Oops, Error!", data: err});
        else if(results.length === 0){
            res.json({message:"Oops, Missing!", data: "User company data doesn't exist (yet)"});
        }
        else{
            res.json({message:"Information Found", data: results})
        }
    });
});

app.get('/', (req,res) => {
    res.send("User DB Online");
});

app.post('/getAllUserCompanies', (req,res) => {
    data = req.headers.userid;
    db.execute(
        `SELECT UserCompanyInfo.companyId, UserCompanyInfo.status FROM UserCompanyInfo
         INNER JOIN UserInfo
         ON UserInfo.id = UserCompanyInfo.userId
         WHERE UserInfo.id = ?`,
        [data], (err, results) => {
        if (err){
            res.json({message:"Oops, Error!", data: err});
            console.log(err);
        }
        else if(results.length === 0){
            res.json({message:"User company data doesn't exist (yet)!", data: results});
        }
        else{
            res.json({message:"Information Found", data: results})
        }
    });
});



app.post('/upload',upload.array('images'),(req,res) => {
    console.log("Image uploaded");
    console.log(req.file);
    // Log file details (including original filename, size, etc.)
    console.log("File details:", req.images);
    console.log("Body data:", req.body); // If you have additional form data

    // Respond to the client
    res.json({
    message: "Image uploaded successfully",
    file: req.file, // Return uploaded file info
    body: req.body, // Return any additional data sent along with the file
    });
});



app.listen(port, ()=>{
    console.log("Server is running on port:" );
});






































// app.post('/getUserCompanyInfo', (req,res) => {
//     data = req.body;
//     console.log("hi")
//     console.log(data)

//     db.execute(
//         `SELECT * FROM UserCompanyInfo
//          INNER JOIN UserInfo
//          ON UserInfo.id = UserCompanyInfo.userId
//          WHERE UserInfo.id = ? AND UserCompanyInfo.companyId = ?`,
//         [data.userId, data.companyId], (err, results) => {
//         if (err)
//             res.json({message:"Oops, Error!", data: err});
//         else if(results.length === 0){
//             res.json({message:"Oops, Missing!", data: "User company data doesn't exist (yet)"});
//         }
//         else{
//             res.json({message:"Information Found", data: results})
//         }
//         console.log("success getting info");
//     });
// });

// app.post('/registerNewUser', (req,res) => {
//     console.log("registering new user")
//     data = req.body;
//     db.execute(
//         `SELECT id FROM UserInfo
//          WHERE id = ?`,
//         [data.userId,], (err, results) => {
//         if (err){
//             res.json({message:"Oops, Error!", data: err});
//             console.log(err);
//         }
//         else if(results.length !== 0){
//             res.json({message:"Oops, user already exists!", data: ""});
//         }
//     });

//     db.execute(
//         `INSERT INTO UserInfo (id) VALUES (?)`,
//         [data.userId,], (err, results) => {
//         if (err){
//             res.json({message:"Oops, Error!", data: err});
//             console.log(err);
//         }
//         else{
//             res.json({message:"User Successfully Added", data: results})
//         }
//         console.log(results);
//     });
// });



