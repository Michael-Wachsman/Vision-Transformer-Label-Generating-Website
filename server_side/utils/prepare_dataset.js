const fs = require('fs');
const path = require('path');

// Function to load a JSON file and convert it into a JavaScript object
function loadJSON(filePath) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log("File loaded successfully!");
    return data;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`Error: The file ${filePath} does not exist.`);
    } else if (error instanceof SyntaxError) {
      console.log(`Error: The file ${filePath} is not a valid JSON file.`);
    } else {
      console.log(`An unexpected error occurred: ${error.message}`);
    }
    return null;
  }
}

// Function to get filenames in a directory
function getFilenamesInDirectory(directoryPath) {
  try {
    // Get a set of filenames in the directory
    const filenames = new Set(fs.readdirSync(directoryPath));
    return filenames;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`Error: The directory ${directoryPath} does not exist.`);
    } else {
      console.log(`An unexpected error occurred: ${error.message}`);
    }
    return new Set();
  }
}

// Function to encode the image
function encodeImage(imagePath) {
  return fs.readFileSync(imagePath).toString('base64');
}

function parseDataset(images) {
  const completionFormat = JSON.stringify({
    "labels": [],
    "weather conditions": [],
    "terrain": [],
    "lighting conditions": [],
    "objects of interest": []
  });
  
  const sysPrompt = `Given an image, predict the following fields in a JSON dict: ${completionFormat}.`;
  
  const formattedData = [];
  
  for (const img of Object.values(images)) {
    const imgPath = `dataset/images/${img.file_name}`;
    const base64Img = encodeImage(imgPath);
    const imgUrl = `data:image/jpeg;base64,${base64Img}`;
    
    const completion = JSON.stringify({
      "labels": img.labels,
      "weather conditions": img.contexts["weather conditions"],
      "terrain": img.contexts.terrain,
      "lighting conditions": img.contexts["lighting conditions"],
      "objects of interest": img.contexts["objects of interest"]
    });
    
    console.log(img);
    
    const dataLine = {
      "messages": [
        {
          "role": "system",
          "content": sysPrompt
        },
        {
          "role": "user",
          "content": [
            { "type": "text", "text": "annotate this image:" },
            {
              "type": "image_url",
              "image_url": {
                "url": imgUrl
              }
            }
          ]
        },
        {
          "role": "assistant",
          "content": completion
        }
      ]
    };
    
    formattedData.push(dataLine);
  }
  
  return [...formattedData,...formattedData];
}

function main() {
  const filePath = "dataset/coco.json";
  const jsonData = loadJSON(filePath);
  
  if (!jsonData) return;
  
  const categories = {};
  for (const c of jsonData.categories) {
    categories[c.id] = c.name;
  }
  
  const filenames = getFilenamesInDirectory("dataset/images");
  const images = {};
  
  for (const img of jsonData.images) {
    if (filenames.has(img.file_name)) {
      images[img.file_name] = img;
    }
  }
  
  // Note: The Python code had 'formatted_data = parse_dataset(images) *2' 
  // which looks like a typo or error. In JavaScript, we just call the function once.
  const formattedData = parseDataset(images);
  
  // Ensure directory exists
  const outputDir = "fine_tune_data";
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write to JSONL file
  const outputFile = path.join(outputDir, "COCO_output.jsonl");
  const writeStream = fs.createWriteStream(outputFile);
  
  for (const item of formattedData) {
    writeStream.write(JSON.stringify(item) + "\n");
  }
  
  writeStream.end();
  console.log("JSONL file has been created!");
}

main();