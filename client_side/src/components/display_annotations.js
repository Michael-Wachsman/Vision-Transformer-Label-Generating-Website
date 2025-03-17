import Paper from '@mui/material/Paper';
import { useState } from "react";
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

export default function DisplayAnnotations({images, annotations, onClose}) {
    // Track edit mode and edited annotations
    const [editMode, setEditMode] = useState(false);
    const [editedAnnotations, setEditedAnnotations] = useState(JSON.parse(JSON.stringify(annotations)));
    const [currentImageIndex, setCurrentImageIndex] = useState(null);
    const [acceptedImages, setAcceptedImages] = useState(new Set());
    const [rejectedImages, setRejectedImages] = useState(new Set());
    const [editedImages, setEditedImages] = useState(new Set());
 
    
    // Function to render an annotation item based on its type
    const renderAnnotationItem = (item, imageIndex, category, itemIndex) => {
        // Handle different types of annotation values
        let content = item;
        if (typeof item === 'object' && item !== null) {
            content = JSON.stringify(item);
            if (Object.keys(content).length == 0){
                content = "N/A";
            }
        }
        
        // In edit mode, add remove button
        const isEditing = editMode && currentImageIndex === imageIndex;
        
        return (
            <div style={{
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '4px 8px',
                margin: '3px',
                fontSize: '13px',
                backgroundColor: '#f5f5f5',
                display: 'inline-flex',
                alignItems: 'center'
            }}>
                {content}
                {isEditing && (
                    <button 
                        onClick={() => removeAnnotationItem(imageIndex, category, itemIndex)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'red',
                            marginLeft: '5px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            padding: '0 3px'
                        }}
                    >
                        ×
                    </button>
                )}
            </div>
        );
    };

    // Function to remove an annotation item
    const removeAnnotationItem = (imageIndex, category, itemIndex) => {
        console.log("remove")
        setEditedAnnotations(prev => {
            const newAnnotations = {...prev};
            if (newAnnotations[imageIndex] && 
                newAnnotations[imageIndex]["gen annotation"] && 
                newAnnotations[imageIndex]["gen annotation"][category]) {
                
                const newItems = [...newAnnotations[imageIndex]["gen annotation"][category]];
                newItems.splice(itemIndex, 1);
                newAnnotations[imageIndex] = {
                    ...newAnnotations[imageIndex],
                    "gen annotation": {
                        ...newAnnotations[imageIndex]["gen annotation"],
                        [category]: newItems
                    }
                };
            }
            return newAnnotations;
        });
    };
    
    // Function to add a new annotation item
    const modifyAnnotationItem = (imageIndex, category, newValue) => {

        if (!newValue.trim()) return;
        
        // console.log(editedAnnotations)
        // console.log("Hi")
            // Create a new copy of the annotations outside the setState callback
        const newAnnotations = {...editedAnnotations};
        
        // Ensure all necessary objects exist
        if (!newAnnotations[imageIndex]) newAnnotations[imageIndex] = {};
        if (!newAnnotations[imageIndex]["gen annotation"]) newAnnotations[imageIndex]["gen annotation"] = {};
        if (!newAnnotations[imageIndex]["gen annotation"][category]) newAnnotations[imageIndex]["gen annotation"][category] = [];
        
        // Add the new item
        if (Array.isArray(newAnnotations[imageIndex]["gen annotation"][category])) {
            newAnnotations[imageIndex]["gen annotation"][category] = [
                ...newAnnotations[imageIndex]["gen annotation"][category],
                newValue
            ];
        } else {
            newAnnotations[imageIndex]["gen annotation"][category] = newValue;
        }
        
        // Update state once with the new object
        setEditedAnnotations(newAnnotations);
    
    };
    
    // Handle accepting annotations for an image
    const handleAccept = (imageIndex) => {
        annotations[imageIndex] = editedAnnotations[imageIndex]
        if (!acceptedImages.has(imageIndex) && !editedImages.has(imageIndex)){
            setAcceptedImages(new Set([...acceptedImages, imageIndex]))
            if(rejectedImages.has(imageIndex)){
                setRejectedImages(prevSet => {
                    const newSet = new Set(prevSet); // Clone the current Set
                    newSet.delete(imageIndex); // Remove the item
                    return newSet; // Update state with the new Set
                });
            }
        }
        setCurrentImageIndex(null);
        setEditMode(false);
    };
    
    // Handle editing annotations for an image (enter edit mode)
    const handleEdit = (imageIndex) => {
        if (!editedImages.has(imageIndex)){
            setEditedImages(new Set([...editedImages, imageIndex]))
        }
        if (!rejectedImages.has(imageIndex)){
            setRejectedImages(new Set([...rejectedImages, imageIndex]))
        }
        if (acceptedImages.has(imageIndex)){
            setAcceptedImages(prevSet => {
                const newSet = new Set(prevSet); // Clone the current Set
                newSet.delete(imageIndex); // Remove the item
                return newSet; // Update state with the new Set
            });
        }
        setCurrentImageIndex(imageIndex);
        setEditMode(true);
    };

    const handleReject = (imageIndex) => {
        if (!rejectedImages.has(imageIndex)){
            setRejectedImages(new Set([...rejectedImages, imageIndex]))
            if(acceptedImages.has(imageIndex)){
                setAcceptedImages(prevSet => {
                    const newSet = new Set(prevSet); // Clone the current Set
                    newSet.delete(imageIndex); // Remove the item
                    return newSet; // Update state with the new Set
                });
            }
        }
        setCurrentImageIndex(null);
        setEditMode(false);
    };
        
    
    // Cancel editing
    const handleCancelEdit = () => {
        setEditedAnnotations(JSON.parse(JSON.stringify(annotations)));
        setEditMode(false);
        setCurrentImageIndex(null);
    };

    console.log(annotations)


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
                overflow: 'hidden',
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <h2 style={{ margin: 0 }}>Image Annotations</h2>
                    <div>
                        
                        <button onClick={() => onClose(editedAnnotations,acceptedImages,editedImages,rejectedImages)} disabled={Object.keys(images).length != (acceptedImages.size + rejectedImages.size)} style={{
                            background: Object.keys(images).length != (acceptedImages.size + rejectedImages.size) ? 'grey' : 'red',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            padding: '5px 10px',
                            cursor: 'pointer'
                        }}>{Object.keys(images).length != (acceptedImages.size + rejectedImages.size) ? "Please first Approve or Reject all images" : "Close"}</button>
                    </div>
                </div>
                
                <div style={{ 
                    overflowX: 'auto',
                    overflowY: 'auto',
                    maxHeight: 'calc(80vh - 80px)',
                    display: 'flex',
                    gap: '20px',
                    paddingBottom: '15px',
                }}>
                    {images.map((image, index) => {
                        // Get annotations for this image
                        const imageAnnotation = editedAnnotations[index];
                        const isEditingThis = editMode && currentImageIndex === index;
                        
                        return (
                            <div key={index} style={{ 
                                minWidth: '320px',
                                maxWidth: '320px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                border: isEditingThis ? '2px solid blue' : '1px solid #ddd',
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
                                        display: 'flex',
                                        gap: '10px',
                                        marginBottom: '10px',
                                        width: '100%',
                                        justifyContent: 'center'
                                    }}>
                                        <button onClick={() => handleAccept(index)} style={{
                                            background: 'green',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '5px',
                                            padding: '5px 15px',
                                            cursor: 'pointer',
                                        }}>Accept</button>
                                        {!editMode && (
                                            <>
                                            <button onClick={() => handleEdit(index)} style={{
                                                background: 'blue',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '5px',
                                                padding: '5px 15px',
                                                cursor: 'pointer',
                                            }}>Edit</button>
                                            <button onClick={() => handleReject(index)} style={{
                                                background: 'red',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '5px',
                                                padding: '5px 15px',
                                                cursor: 'pointer',
                                            }}>Reject</button>
                                            {acceptedImages.has(index) && <CheckIcon/>}
                                            {(rejectedImages.has(index) && !editedImages.has(index))&& <CloseIcon/>}
                                            {editedImages.has(index) && <CheckBoxIcon/>}
                                        </>
                                        )}
                                        {editMode && (
                                            <>
                                                <button onClick={handleCancelEdit} style={{
                                                    background: '#777',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '5px',
                                                    padding: '5px 10px',
                                                    marginRight: '10px',
                                                    cursor: 'pointer',
                                                }}>Cancel</button>
                                            </>
                                        )}
                                    </div>
                                
                                
                                <div style={{ 
                                    width: '100%',
                                    maxHeight: isEditingThis ? '300px' : '250px',
                                    overflowY: 'auto',
                                    padding: '10px',
                                    backgroundColor: 'white',
                                    borderRadius: '4px',
                                    border: '1px solid #eee',
                                }}>
                                    <h4 style={{ margin: '0 0 10px 0' }}>Annotations</h4>
                                    
                                    {/* Display annotations based on actual structure */}
                                    {imageAnnotation && imageAnnotation["gen annotation"] ? (
                                        <div>
                                            {Object.entries(imageAnnotation["gen annotation"]).map(([category, value], idx) => (
                                                <div key={idx} style={{ marginBottom: '15px' }}>
                                                    <h5 style={{ 
                                                        margin: '0 0 5px 0',
                                                        fontSize: '15px',
                                                        color: '#444'
                                                    }}>
                                                        {category}:
                                                    </h5>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                                        {Array.isArray(value) ? (
                                                            value.map((item, itemIdx) => (
                                                                <span key={itemIdx}>
                                                                    {renderAnnotationItem(item, index, category, itemIdx)}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            renderAnnotationItem(value, index, category, 0)
                                                        )}
                                                    </div>
                                                    
                                                    {/* Add new annotation form */}
                                                    {isEditingThis && (
                                                        <div style={{ 
                                                            marginTop: '8px',
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}>
                                                            <input 
                                                                type="text" 
                                                                placeholder={Array.isArray(value) ? `Add new ${category}...` : `Update ${category}...`}
                                                                style={{
                                                                    padding: '5px',
                                                                    borderRadius: '4px',
                                                                    border: '1px solid #ccc',
                                                                    flex: 1
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        modifyAnnotationItem(index, category, e.target.value);
                                                                        e.target.value = '';
                                                                    }
                                                                }}
                                                            />
                                                            <button 
                                                                onClick={(e) => {
                                                                    const input = e.target.previousSibling;
                                                                    modifyAnnotationItem(index, category, input.value);
                                                                    input.value = '';
                                                                }}
                                                                style={{
                                                                    background: '#4CAF50',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    padding: '5px 8px',
                                                                    marginLeft: '5px',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                {Array.isArray(value) ? "Add" : "Update"}
                                                            </button>
                                                        </div>
                                                    )}
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