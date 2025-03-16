const fs = require("fs");
const OpenAI = require("openai")

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




app.get('/debug', (req, res) => {
    db.execute(
        `SELECT * FROM ImageInfo`, (err, results) => {
            if (err)
                res.json({ message: "Oops, Error!", data: err });
            else if (results.length === 0) {
                res.json({ message: "Oops, Missing!", data: "Empty" });
            }
            else {
                res.json({ message: "Information Found", data: results })
            }
        });
});

app.get('/', (req, res) => {
    res.send("User DB Online");
});



app.post('/upload', upload.array('images'), async (req, res) => {
    console.log("Image uploaded");

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
    }

    // console.log(req.files);
    resp_json = []
    try{
        for (const img of req.files){

            annotation = await query_img(img["path"]);
            
            resp_json.push(
                {
                    title: img["originalname"],
                    "gen annotation": annotation,
                    status: "success",
                }
            );

            db.execute(
                `INSERT INTO ImageInfo (fileName, filePath, annotations) VALUES (?,?,?)`,
                [img["originalname"],img["path"], annotation], (err, results) => {
                if (err){
                    console.log("DB Error" + err);
                    return res.json({message:"Oops, Error!", data: err});
                }
                console.log("success inserting info");
            });
        };
        console.log("finished queries")
        // Respond to the client
        return res.json({
            message: "Imagees uploaded and queried successfully",
            "query results": resp_json
        });
    } catch(error){
        console.log(error)
        return res.send(error)
    }

});



const openai = new OpenAI({ apiKey: process.env.API_KEY, });

const model = "gpt-4o-mini-2024-07-18"


async function query_img(imagePath) {
    const base64Image = fs.readFileSync(imagePath, "base64");

    const jobStatus = await openai.fineTuning.jobs.retrieve("ftjob-buwhYev77BaFz5nD4xOW2OlK");
    const fineTunedModelId = jobStatus.fine_tuned_model;
    // console.log(fineTunedModelId)

    try {
        const response = await openai.chat.completions.create({
            model: fineTunedModelId,
            messages: [
                { 
                    role: "system", 
                    content: "Given an image, enter the relevant information for each of the following fields in a JSON dict: {\"labels\": [<array of labels>], \"environment\": \"environment observations\", and \"objects of interest\": [<array of object names>]}." 
                },
                { 
                    role: "system", 
                    content: "Give one final field for what you would caption the image as" 
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "what's in this image?" },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`,
                            },
                        },
                    ],
                }],
        });

        const query_res = response;

        console.log("Query done:", query_res);
        message = query_res.choices?.[0]?.message?.content || "No response"
        return JSON.parse(message); // Send the response back to the frontend
    } catch (error) {
        console.error("Error:", error);
        return {}
    }
}


app.get('/query', async (req, res) => {

    try {
        const response = await openai.chat.completions.create({
            model: model,
            messages: [
                {
                    "role": "developer",
                    "content": "You are a helpful assistant named Jeff."
                },
                {
                    "role": "user",
                    "content": "Hello, whats your name!"
                }
            ],
        });

        const query_res = response;

        console.log("Query done:", query_res);
        message = query_res.choices?.[0]?.message?.content || "No response"
        res.json(message); // Send the response back to the frontend
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Failed to fetch response from OpenAI" });
    }
});



const server = app.listen(port, () => {
    console.log("Server is running on port:");
});


// Handle shutdown signals (Ctrl+C or SIGTERM)
process.on('SIGINT', () => {
    console.log('Graceful shutdown initiated...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0); // Exit the process after closing the server
    });
});































// app.get('/query_img', async (req, res) => {
//     const imagePath = "uploads/1742124673049-75353260_p0.jpeg";
//     const base64Image = fs.readFileSync(imagePath, "base64");

//     const jobStatus = await openai.fineTuning.jobs.retrieve("ftjob-buwhYev77BaFz5nD4xOW2OlK");
//     const fineTunedModelId = jobStatus.fine_tuned_model;
//     console.log(fineTunedModelId)

//     try {
//         const response = await openai.chat.completions.create({
//             model: fineTunedModelId,
//             messages: [
//                 { 
//                     role: "system", 
//                     content: "Given an image, enter the relevant information for each of the following fields in a JSON dict: {\"labels\": [<array of labels>], \"environment\": \"environment observations\", and \"objects of interest\": [<array of object names>]}." 
//                 },
//                 { 
//                     role: "system", 
//                     content: "Give one final field for what you would caption the image as" 
//                 },
//                 {
//                     role: "user",
//                     content: [
//                         { type: "text", text: "what's in this image?" },
//                         {
//                             type: "image_url",
//                             image_url: {
//                                 url: `data:image/jpeg;base64,${base64Image}`,
//                             },
//                         },
//                     ],
//                 }],
//         });

//         const query_res = response;

//         console.log("Query done:", query_res);
//         message = query_res.choices?.[0]?.message?.content || "No response"
//         res.json(message); // Send the response back to the frontend
//     } catch (error) {
//         console.error("Error:", error);
//         res.status(500).json({ error: "Failed to fetch response from OpenAI" });
//     }
// });







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


// app.post('/getAllUserCompanies', (req, res) => {
    //     data = req.headers.userid;
    //     db.execute(
    //         `SELECT UserCompanyInfo.companyId, UserCompanyInfo.status FROM UserCompanyInfo
    //          INNER JOIN UserInfo
    //          ON UserInfo.id = UserCompanyInfo.userId
    //          WHERE UserInfo.id = ?`,
    //         [data], (err, results) => {
    //             if (err) {
    //                 res.json({ message: "Oops, Error!", data: err });
    //                 console.log(err);
    //             }
    //             else if (results.length === 0) {
    //                 res.json({ message: "User company data doesn't exist (yet)!", data: results });
    //             }
    //             else {
    //                 res.json({ message: "Information Found", data: results })
    //             }
    //         });
    // });
    
