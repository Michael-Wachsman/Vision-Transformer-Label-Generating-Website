import { useState } from "react";
import { Button } from "@mui/material";
import axios from "axios";
import DisplayAnnotations from "./display_annotations";
import logo from '../logo.svg';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';


export default function MultipleImageUpload() {
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [generatedAnnotations, setGeneratedAnnotations] = useState({})
  const [loading, setLoading] = useState(false)

  const handleImageChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const imagePreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setImages(prevImages => [...prevImages, ...imagePreviews]);
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
  };

  const handleUpload = async () => {
    setLoading(true)
    const formData = new FormData();
    files.forEach(file => formData.append("images", file));

    try {
      const response = await axios.post("http://localhost:4440/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setGeneratedAnnotations(response.data["image results"])
      setLoading(false);
      setShowAnnotations(true)
      console.log("Upload successful:", response.data);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const removeImage = (index) => {
    // Create new arrays without the removed item
    const newImages = [...images];
    const newFiles = [...files];
    
    // Remove the image and file
    newImages.splice(index, 1);
    newFiles.splice(index, 1);
    
    // Update state
    setImages(newImages);
    setFiles(newFiles);
  };

  async function annotationClose(editedAnnotations, approved, edited, rejected){
    setShowAnnotations(false);

    let payload = [];
    console.log(editedAnnotations)

    for(const [index, img] of editedAnnotations.entries()){
      console.log("I seek to know")
      console.log(editedAnnotations)
      console.log(approved)

      let approval_status = ""
      if(approved.has(index)){
        approval_status = "approved"
      }
      else if(edited.has(index)){
        approval_status = "edited"
      }
      else{
        approval_status = "rejected"
      }

      let info = {
        "id": img["id"],
        "true annotation": img["gen annotation"],
        "approval status": approval_status
      }

      payload.push(info)
    }

    await axios.post("http://localhost:4440/updateImageAnnotation", payload, {headers: {'Content-Type': 'application/json'}})
      .then(response => {
        console.log('Success:', response.data);
      })
      .catch(error => {
        console.error('Error:', error);
      });

    return
  }




  const gridStyle = {
    marginTop: '1rem',
    display: 'grid',
    gridTemplateColumns: `repeat(${Math.min(files.length,4)}, 1fr)`, // Dynamic columns
    gap: '0.5rem',
    justifyContent: 'center',
  };

  return (
    <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
    <div className="p-4 border rounded-lg w-full max-w-md mx-auto">
      {showAnnotations && <DisplayAnnotations images={images} annotations={generatedAnnotations} onClose={annotationClose} />}
      {loading &&
        <Box sx={{ display: 'flex' }}>
        <CircularProgress />
        </Box>
      }
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
        id="imageUpload"
        style={{ display: 'none' }}
      />
      <label htmlFor="imageUpload">
        <Button variant="contained" component="span">Select Images</Button>
      </label>
      { files.length > 0 &&
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleUpload} 
        disabled={files.length === 0} 
        className="mt-2">
        Upload Images
      </Button> 
      }
      <div style={gridStyle}>
        {images.map((image, index) => (
        
          <div key={index} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center',alignContent: 'center', position: 'relative' }}>
            <img 
              src={image} 
              alt={`preview ${index}`}
              style={{ maxWidth: '200px', height: 'auto', objectFit: 'cover', justifyContent: 'center' }}
              className="w-full h-24 object-cover rounded"
            />
            <button
              onClick={() => removeImage(index)}
              aria-label="Remove image"
              style={{ maxWidth: '200px', height: 'auto'}}
            >
              remove
            </button>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: '400px' }}/> 
    </div>
    </header>
  );
}
