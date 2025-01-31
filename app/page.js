"use client"
import React, { useState } from 'react';
import Header from '../../prepmania/app/dashboard/components/Header'
import { Button } from '@/components/ui/button';

export default function Home() {
  // Array of locally stored images (reference images from the public folder)
  const images = [
    '/ace.png',        
    '/helpofAI.png',    
    '/getfeedback.png',
  ];

  // State for the current image index
  const [currentIndex, setCurrentIndex] = useState(0);

  // Function to go to the next image
  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  // Function to go to the previous image
  const prevImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
    <><Header />
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh', // Full height of the viewport
        width: '100vw', // Full width of the viewport
        backgroundColor: 'rgba(0, 0, 0, 0)', // Optional: To highlight the area around the carousel
      }}
    >
      <div
        style={{
          width: '70vw', // Width of the container (adjust this as needed)
          height: '79vh', // Height of the container (adjust this as needed)
          borderRadius: '15px', // Border radius for rounded corners
          overflow: 'hidden', // Ensures the images do not overflow the rounded corners
          position: 'relative',
          marginBottom:'70px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)', // Optional: Add some shadow for visual effect
        }}
      >
        {/* Image display */}
        <div>
          <img
            src={images[currentIndex]}
            alt={`Carousel ${currentIndex}`}
            style={{
              width: '100%',  // Image width should cover the full width of the container
              height: '100%', // Image height should cover the full height of the container
              objectFit: 'cover', // Ensure the image covers the area without distortion
            }}
          />
        </div>

        {/* Navigation buttons */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '0',
            right: '0',
            display: 'flex',
            justifyContent: 'space-between',
            transform: 'translateY(-50%)',
            padding: '0 20px',
          }}
        >
          <button
            onClick={prevImage}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              border: 'none',
              fontSize: '24px',
              padding: '10px',
              cursor: 'pointer',
            }}
          >
            Previous
          </button>
          <button
            onClick={nextImage}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              border: 'none',
              fontSize: '24px',
              padding: '10px',
              cursor: 'pointer',
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
    <div
      style={{
        width: '100%', // Full width of the container
        height: '100vh', // Full height of the container (viewport height)
        backgroundImage: 'url("/prepmania.png")', // Path to your image in the public folder
        backgroundSize: 'cover', // Ensure the background image covers the entire div
        backgroundPosition: 'center', // Center the background image
        display: 'flex', // Use flexbox for centering
        justifyContent: 'center', // Horizontally center the content
        alignItems: 'center', // Vertically center the content
        color: 'white', // Text color for the content inside the div
        position: 'relative', // Allow for absolute positioning of the button
      }}
    >
      {/* Button inside the div */}
      <Button
       style={{
        padding: '15px 30px',
        fontSize: '18px',
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent black background
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        position: 'absolute', // Allows easy positioning with top, left, etc.
        top: '50%', // Vertical center (can be adjusted)
        left: '30%', // Horizontal center (can be adjusted)
        transform: 'translate(-50%, -50%)', // Centers the button exactly in the middle
      }}
      >START</Button>
    </div>
    </>
  );
}
