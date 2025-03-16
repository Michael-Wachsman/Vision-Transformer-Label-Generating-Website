import { useState } from "react";
import { Button } from "@mui/material";
import axios from "axios";

export default function MultipleImageUpload() {
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);

  const handleImageChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const imagePreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setImages(prevImages => [...prevImages, ...imagePreviews]);
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    files.forEach(file => formData.append("images", file));

    try {
      const response = await axios.post("http://localhost:4440/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Upload successful:", response.data);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <div className="p-4 border rounded-lg w-full max-w-md mx-auto">
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
        id="imageUpload"
      />
      <label htmlFor="imageUpload">
        <Button variant="contained" component="span">Select Images</Button>
      </label>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleUpload} 
        disabled={files.length === 0} 
        className="mt-2">
        Upload Images
      </Button>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {images.map((image, index) => (
          <img key={index} src={image} alt="preview"   style={{ maxWidth: '200px', height: 'auto', objectFit: 'cover' }} className="rounded" />
        ))}
      </div>
    </div>
  );
}
