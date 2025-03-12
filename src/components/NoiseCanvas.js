// import React, { useEffect, useRef } from 'react';

// const NoiseCanvas = () => {
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');

//     const generateNoise = () => {
//       const imageData = ctx.createImageData(canvas.width, canvas.height);
//       const data = imageData.data;

//       for (let i = 0; i < data.length; i += 4) {
//         const grayscale = Math.random() * 100; // Random grayscale value
//         data[i] = grayscale; // Red
//         data[i + 1] = grayscale; // Green
//         data[i + 2] = grayscale; // Blue
//         data[i + 3] = 255; // Alpha (fully opaque)
//       }

//       ctx.putImageData(imageData, 0, 0);
//     };

//     const loopNoise = () => {
//       generateNoise();
//       requestAnimationFrame(loopNoise);
//     };

//     loopNoise();
//   }, []);

//   return (
//     <canvas
//       ref={canvasRef}
//       className='h-full w-full'
//       style={{
//         display: 'block',
//         background: 'black',
//       }}
//     ></canvas>
//   );
// };

// export default NoiseCanvas;

import React, { useEffect, useRef } from "react";

const NoiseCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const generateNoise = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const grayscale = Math.random() * 100; // Darker noise
        data[i] = grayscale; // Red
        data[i + 1] = grayscale; // Green
        data[i + 2] = grayscale; // Blue
        data[i + 3] = 255; // Alpha (fully opaque)
      }

      ctx.putImageData(imageData, 0, 0);
    };

    const applyVintageOverlay = () => {
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        Math.min(canvas.width, canvas.height) / 2,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height)
      );

      gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
      gradient.addColorStop(0.7, "rgba(0, 0, 0, 0.4)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.8)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const loopNoise = () => {
      generateNoise();
      applyVintageOverlay();
      requestAnimationFrame(loopNoise);
    };

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    // Debounce function to limit resize calls
    const debounce = (func, delay) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
      };
    };

    const handleResize = debounce(() => {
      resizeCanvas();
    }, 200);

    resizeCanvas(); // Initial sizing
    loopNoise(); // Start animation

    // Add debounced resize listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      style={{
        display: "block",
        background: "black",
      }}
    ></canvas>
  );
};

export default NoiseCanvas;

