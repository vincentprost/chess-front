import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [responseImage, setResponseImage] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [loading, setLoading] = useState(false); // State for loading indicator


  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('image', selectedFile);
    setLoading(true); // Start loading

    try {
      const response = await axios.post('https://api.vincentprost.com/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
      });
      console.log(response)
      
      if (response.status === 200) {
        const imageUrl = URL.createObjectURL(response.data);
        setResponseImage(imageUrl);
        setUploadSuccess(true);
        setUploadError(null);
      }
    } catch (error) {
      setUploadError('Failed to upload image');
      setUploadSuccess(false);
      setResponseImage(null);
    } finally {
      setLoading(false); 
      if(selectedFile){
        const fileUrl = URL.createObjectURL(selectedFile);
        setPreviewImage(fileUrl);
      }
      
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Chess Vision</h1>
        <form onSubmit={handleSubmit}>
          <input type="file" onChange={handleFileChange} />
          <button type="submit">Compute</button>
        </form>
        {loading && <p>Computing...</p>} {/* Loading indicator */}
        {uploadSuccess && <p>Image computed successfully</p>}

        <div className="image-container">

          {previewImage && (
              <div className="image-wrapper">              
                <img src={previewImage} alt="Uploaded file preview" style={{ width: '300px', marginTop: '20px' }} />
              </div>
            )}
          {responseImage && (
            <div className="image-wrapper">
              <img src={responseImage} alt="Received from server" style={{ width: '300px', marginTop: '20px' }} />
            </div>
          )}
        </div>
        {uploadError && <p>{uploadError}</p>}
      </header>
    </div>
  );
}

export default App;