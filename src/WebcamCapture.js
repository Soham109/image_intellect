import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import './WebcamCapture.css';

const WebcamCapture = () => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    setMessage("Photo captured");
  }, [webcamRef]);

  const uploadImage = async () => {
    if (image) {
      setMessage("Uploading photo...");
  
      const response = await fetch(image);
      const blob = await response.blob();
  
      const apiResponse = await fetch(`${process.env.REACT_APP_API_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': process.env.REACT_APP_API_KEY,
          'Content-Type': 'application/octet-stream',
        },
        body: blob,
      });
  
      const result = await apiResponse.json();
      const formattedText = formatResponse(result);
      setMessage(formattedText);
    }
  };

  const formatResponse = (response) => {
    let text = "";
    if (response.description && response.description.captions && response.description.captions.length > 0) {
      text += `Description: ${response.description.captions[0].text}\n`;
    }
    if (response.description && response.description.tags && response.description.tags.length > 0) {
      text += `Tags: ${response.description.tags.join(", ")}\n`;
    }

    return text.trim();
  };

  return (
    <div className="container">
      <header className="header">
        <h1>ImageIntellect</h1>
      </header>
      <div className="content">
        <div className="webcam-container">
          <div className="webcam-wrapper">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="webcam"
            />
            <button onClick={capture} className="capture-button">Capture photo</button>
          </div>
          {image && (
            <div className="captured-wrapper">
              <img src={image} alt="Captured" className="captured-image" />
              <button onClick={uploadImage} className="upload-button">Upload and Analyze</button>
            </div>
          )}
        </div>
        <div className="message">
          <pre>{message}</pre>
        </div>
      </div>
    </div>
  );
};

export default WebcamCapture;
