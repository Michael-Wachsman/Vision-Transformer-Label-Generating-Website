import { generateUtilityClass } from '@mui/material';
import Paper from '@mui/material/Paper';
import { useState } from "react";

export default function DisplayAnnotations({images, annotations, onClose}) {
    // Function to render an annotation item based on its type
    const renderAnnotationItem = (item) => {
        // Handle different types of annotation values
        let content = item;
        if (typeof item === 'object' && item !== null) {
            content = JSON.stringify(item);
            if (content.length > 0){
                content = "N/A"
            }
        }


        
        return (
            <div style={{
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '4px 8px',
                margin: '3px',
                fontSize: '13px',
                backgroundColor: '#f5f5f5',
                display: 'inline-block'
            }}>
                {content}
            </div>
        );
    };

    return(
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
        }}>
            <Paper elevation={3} style={{ 
                padding: '20px', 
                maxWidth: '90vw', 
                maxHeight: '80vh',
                width: '800px',
                position: 'relative',
                overflow: 'scroll',
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'red',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    padding: '5px 10px',
                    cursor: 'pointer',
                    zIndex: 2,
                }}>Close</button>
                
                <h2 style={{ marginBottom: '20px' }}>Image Annotations</h2>
                
                <div style={{ 
                    overflowX: 'auto',
                    display: 'flex',
                    gap: '20px',
                    paddingBottom: '15px',
                }}>
                    {images.map((image, index) => {
                        // Get annotations for this image
                        // This assumes annotations has keys corresponding to image indexes
                        // Adjust this logic based on your actual data structure
                        const imageAnnotation = annotations[index];
                        
                        return (
                            <div key={index} style={{ 
                                minWidth: '300px',
                                maxWidth: '300px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '15px',
                                backgroundColor: '#f9f9f9',
                            }}>
                                <img 
                                    src={image} 
                                    alt={`Image ${index + 1}`} 
                                    style={{ 
                                        width: '100%',
                                        height: '200px',
                                        objectFit: 'contain',
                                        marginBottom: '15px',
                                        borderRadius: '4px',
                                    }} 
                                />
                                <div style={{ 
                                    width: '100%',
                                    maxHeight: '250px',
                                    overflowY: 'auto',
                                    padding: '10px',
                                    backgroundColor: 'white',
                                    borderRadius: '4px',
                                    border: '1px solid #eee',
                                }}>
                                    <h4 style={{ margin: '0 0 10px 0' }}>Annotations</h4>
                                    
                                    {/* Display annotations based on actual structure */}
                                    {imageAnnotation ? (
                                        <div>
                                            {Object.entries(imageAnnotation["gen annotation"]).map(([key, value], idx) => (
                                                <div key={idx} style={{ marginBottom: '10px' }}>
                                                    <h5 style={{ 
                                                        margin: '0 0 5px 0',
                                                        fontSize: '15px',
                                                        color: '#444'
                                                    }}>
                                                        {key}:
                                                    </h5>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                                        {Array.isArray(value) ? (
                                                            value.map((item, itemIdx) => (
                                                                <span key={itemIdx}>
                                                                    {renderAnnotationItem(item)}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            renderAnnotationItem(value)
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p>No annotations for this image</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Paper>
        </div>
    );
}