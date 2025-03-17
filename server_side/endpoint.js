const fs = require("fs");
const OpenAI = require("openai")
const sharp = require('sharp');

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



const openai = new OpenAI({ apiKey: process.env.API_KEY, });
const model = "gpt-4o-mini-2024-07-18"
const job_id = "ftjob-buwhYev77BaFz5nD4xOW2OlK"



app.get('/debug', (req, res) => {
    db.execute(
        `SELECT * FROM PerfHist`, (err, results) => {
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






async function resizeImage(path) {
    try {
        tmpPath = path + "khzkcdvajesbOIv"
        await sharp(path)
            .resize({height: 200}) // Resize to given width & height
            .toFile(tmpPath);

        fs.renameSync(tmpPath, path, ()=>{
            fs.unlink(tmpPath);
        });
        console.log(`Image resized and saved to ${path}`);
    } catch (err) {
        console.error("Error resizing image:", err);
    }
}


app.post('/upload', upload.array('images'), async (req, res) => {
    console.log("Image uploaded");

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
    }

    // console.log(req.files);
    resp_json = []
    try{
        for (const img of req.files){
            await resizeImage(img["path"]);

            annotation = await query_img(img["path"]);
            const results = await new Promise((resolve, reject) => {
                db.execute(
                    `INSERT INTO ImageInfo (fileName, filePath, annotations) VALUES (?,?,?)`,
                    [img["originalname"],img["path"], annotation], (err, results) => {
                    if (err){
                        console.log("DB Error" + err);
                        return res.json({message:"Oops, Error!", data: err});
                    }
                    else{
                        resolve(results);
                    }

                    
                });
            });
            resp_json.push(
                {
                    id: results.insertId,
                    title: img["originalname"],
                    "gen annotation": annotation
                }
            );
            console.log("success inserting info");
        };
        console.log("finished queries")
        // Respond to the client
        return res.json({
            message: "Imagees uploaded and queried successfully",
            "image results": resp_json
        });
    } catch(error){
        console.log(error)
        return res.send(error)
    }

});


async function query_img(imagePath) {
    const base64Image = fs.readFileSync(imagePath, "base64");

    const jobStatus = await openai.fineTuning.jobs.retrieve(job_id);
    const fineTunedModelId = jobStatus.fine_tuned_model;
    // console.log(fineTunedModelId)

    try {
        const response = await openai.chat.completions.create({
            model: fineTunedModelId,
            messages: [
                { 
                    role: "system", 
                    content: "Given an image, enter the relevant information for each of the following fields in a JSON dict: {\"labels\": [<array of labels>], \"environment\": [< array of environment observations >], and \"objects of interest\": [<array of object names>]}." 
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

        console.log(imagePath + " Query done");
        message = query_res.choices?.[0]?.message?.content || "No response"
        if(message === "No Response"){
            message = {
                "labels": [],
                "environment": [],
                "objects of interest": [],
                "caption": ""
              }
        }
        return JSON.parse(message); // Send the response back to the frontend
    } catch (error) {
        console.error("Error:", error);
        return {}
    }
}


app.post('/updateImageAnnotation', async (req,res) => {
    data = req.body;
    

    try{
        approvedIds = []
        rejectedIds = []

        for(const img of data){
            if (img["approval status"] === "approved"){
                approvedIds.push(img["id"])
            }
            else{
                rejectedIds.push(img["id"])
            }
            db.execute(
                `UPDATE ImageInfo
                SET trueAnnotations = ?, approvalStatus = ?
                WHERE ImageInfo.id = ? `,
            [img["true annotation"], img["approval status"], img["id"]], (err, result) => {
                if(err){
                    console.log(err)
                    return res.send(err)
                }
            });
        }

        db.execute(
            `INSERT INTO PerfHist (approvalPercentage, approvedIds, rejectedIds) VALUES (?,?,?)`,
            [approvedIds.length / (approvedIds.length + rejectedIds.length),JSON.stringify(approvedIds), JSON.stringify(rejectedIds)], (err, results) => {
                if(err){
                    console.log(err)
                    return res.send(err)
                }
            });


        console.log("updated image annotations")
        return res.send("information entered")
    }catch(error){
        console.log(error)
        return res.send(error)
    }

});



app.get('/getPerfHist', async (req,res) => {
    data = req.body;

    try{
        db.execute(
            `SELECT * FROM PerfHist`,
            (err, results) => {
                if(err){
                    console.log(err)
                    return res.send(err)
                }
                else{
                    return res.json(results)
                }
        });
    }catch(error){
        console.log(error)
        return res.send(error)
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



