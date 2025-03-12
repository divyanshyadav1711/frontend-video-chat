import { useState, useEffect } from "react";

const useVideoStream = () => {
  const [stream, setStream] = useState(null);
  const [loadingLocalStream, setLoadingLocalStream] = useState(true);

  const initializeStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(stream);
      setLoadingLocalStream(false);
    } catch (error) {
      console.error("Error accessing media devices:", error);
      setLoadingLocalStream(false);
    }
  };

  useEffect(() => {
    initializeStream();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return { stream, loadingLocalStream };
};

export default useVideoStream;