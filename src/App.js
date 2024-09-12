import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import ChessBoardFromFEN from './ChessBoardFromFEN.js';
import { Chessboard } from 'react-chessboard';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  //const [responseImage, setResponseImage] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [loading, setLoading] = useState(false); // State for loading indicator
  const [piecesPosition, setPiecesPosition] = useState(null); // State to hold pieces position data
  const [fen, setFen] = useState(null); // Position de départ


  const canvasRef = useRef(null); // Reference to the canvas element

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
      const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response)

      if (response.status === 200) {
        const piecesPos = response.data.pieces_boxes;
        console.log(response.data)

        setFen(response.data.fen);
        setPiecesPosition(piecesPos);

        setUploadSuccess(true);
        setUploadError(null);
      }
    } catch (error) {
      setUploadError('Failed to upload image');
      setUploadSuccess(false);
      setFen(null);
    } finally {
      setLoading(false);
      if (selectedFile) {
        const fileUrl = URL.createObjectURL(selectedFile);
        setPreviewImage(fileUrl);
      }

    }
  };

  useEffect(() => {
    if (previewImage && piecesPosition && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Reset canvas size and clear previous drawings
      const img = new Image();
      img.src = previewImage;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Draw the boxes over the image
        piecesPosition.forEach(([x, y, w, h]) => {
          ctx.strokeStyle = 'red';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, w, h); // Draw each box
        });

        console.log("image size: ", img.width, img.height);
      };
    }
  }, [previewImage, piecesPosition]);

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
            <>
              <div className="image-wrapper">
                {//<img src={previewImage} alt="Uploaded file preview" style={{ width: '300px', marginTop: '20px', display: 'block', maxWidth: '100%' }} />
                }

              </div>
              <canvas
                ref={canvasRef}
                style={{ width: '300px', marginTop: '20px', display: 'block', maxWidth: '100%' }}
              />
            </>
          )}

          {fen && (
            <>
              <div className="image-wrapper">
                {//<img src={responseImage} alt="Received from server" style={{ width: '300px', marginTop: '20px' }} />
                }
                < ChessBoardFromFEN fen={fen} />
              </div>
            </>
          )}
        </div>
        {uploadError && <p>{uploadError}</p>}
      </header>
    </div>
  );
}

export default App;