import React, { useRef, useEffect, useState } from "react";
import ChatMessages from "./ChatMessages";
import NextStopButtons from "./NextStopButtons";
import useVideoStream from "../hooks/useVideoStream";
import useWebSocket from "../hooks/useWebSocket";
import useWebRTC from "../hooks/useWebrtc";
import VideoStreams from "./VideoStreams";

const serverUrl = process.env.REACT_APP_SERVER_URL;

const App = () => {
  const [messages, setMessages] = useState([]);
  const [chatHeight, setChatHeight] = useState(0);
  const [localImage, setLocalImage] = useState(null);
  // const [peerImage, setPeerImage] = useState(null);

  const ws = useRef(null);
  const myVideo = useRef(null);
  const userVideo = useRef(null);
  const videoContainerRef = useRef(null);

  const { stream, loadingLocalStream } = useVideoStream();
  const { ws: newWs, connected, connecting, connectWebSocket,
    disconnect: disconnectWebSocket, sendMessage, setConnecting } = useWebSocket(serverUrl, {
      onOpen: () => {
        console.log("[WebSocket] Connection opened.");
      },
      onMessage: handleWebSocketMessage,
      onClose: handleWebSocketClose,
    });

  const {
    remoteStream,
    callAccepted,
    connectionState,
    initializeCall,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    endCallCleanup,
  } = useWebRTC(stream, sendMessage, resetMessages);

  useEffect(() => {
    if (stream) {
      console.log("[App] Local stream loaded.");
      myVideo.current.srcObject = stream;
    }
  }, [stream]);


  useEffect(() => {
    if (remoteStream) {
      console.log("[App] Remote stream loaded.");
      userVideo.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (newWs) {
      console.log("[WebSocket] WebSocket instance updated.");
      ws.current = newWs;
    }
  }, [newWs]);


  const handleResize = () => {
    if (videoContainerRef.current) {
      const videoHeight = videoContainerRef.current.offsetHeight;
      const windowHeight = window.innerHeight;
      const remainingHeight = windowHeight - videoHeight;
      setChatHeight(remainingHeight);
      console.log("[App] Chat height recalculated:", remainingHeight);
    }
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    console.log("[App] Connection State:", connectionState);
    console.log("[App] WebSocket State:", connected);

    if (connectionState === 'failed' && connected) {
      console.log("[App] Connection failed, calling nextConnection().");
    }
    if (connectionState === 'connected' && !connected) {
      console.log("[App] Connected again.");
    }
  }, [connectionState, connected]);

  const handleSendMessage = (inputMessage, clearMessage) => {
    if (!inputMessage || inputMessage?.trim() === "") return;
    console.log("[App] Sending chat message:", inputMessage);
    sendMessage({ type: "chat", data: inputMessage });
    setMessages((prev) => [...prev, { type: "me", text: inputMessage }]);
    clearMessage();
  };

  const handleReceiveMessage = (message) => {
    console.log("[App] Received chat message:", message);
    setMessages((prev) => [
      ...prev,
      { type: "user", text: message },
    ]);
  };

  const captureLocalImage = () => {
    const video = document.getElementById('localVideo');
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 120;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
    console.log("[App] Captured local image:", dataUrl);
    setLocalImage(dataUrl);
  };

  function handleWebSocketMessage(data) {
    console.log("[WebSocket] Received message:", data);

    switch (data.type) {
      case "start-call":
        console.log("[WebSocket] Start call received.");
        initializeCall();
        break;
      case "offer":
        console.log("[WebSocket] Offer received.");
        handleOffer(data.offer);
        break;
      case "answer":
        console.log("[WebSocket] Answer received.");
        handleAnswer(data.answer);
        break;
      case "ice-candidate":
        console.log("[WebSocket] ICE candidate received.");
        handleIceCandidate(data.candidate);
        break;
      case "peer-disconnected":
        console.log("[WebSocket] Peer disconnected.");
        handlePeerDisconnected();
        break;
      case "pong":
        console.log("[WebSocket] Pong received.");
        break;
      case "chat":
        console.log("[WebSocket] Chat message received.");
        handleReceiveMessage(data.data);
        break;
      default:
        console.log("[WebSocket] Unknown message type:", data.type);
    }
  };

  function handleWebSocketClose() {
    console.error("[WebSocket] WebSocket connection closed.");
    endCallCleanup();
  };

  function resetMessages() {
    console.log("[App] Resetting chat messages.");
    setMessages([]);
  };

  const nextConnection = () => {
    console.log("[App] Initiating next connection.");
    setConnecting(true);
    endCallCleanup();
    if (ws.current) {
      console.log("[WebSocket] Sending 'next' message.");
      sendMessage({ type: "next" });
    } else {
      console.log("[WebSocket] WebSocket is not connected.");
      connectWebSocket();
    }
  };

  const handlePeerDisconnected = () => {
    console.log("[App] Peer disconnected.");
    endCallCleanup();
    if (ws.current) {
      console.log("[WebSocket] Sending 'ready' message.");
      sendMessage({ type: "ready" });
    } else {
      console.log("[WebSocket] WebSocket is not connected.");
      connectWebSocket();
    }
  };

  return (
    <div className="flex flex-col sm:h-screen">
      {/* Video Streams */}
      <div ref={videoContainerRef}>
        <VideoStreams
          loadingLocalStream={loadingLocalStream}
          connected={connected}
          connectionState={connectionState}
          localVideoRef={myVideo}
          remoteVideoRef={userVideo}
        />
      </div>
      {/* Buttons and Chat Window */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* Buttons Section */}
        <NextStopButtons
          connected={connected}
          connecting={connecting}
          connectionState={connectionState}
          connectWebSocket={connectWebSocket}
          disconnectWebSocket={disconnectWebSocket}
          nextConnection={nextConnection}
        />

        {/* Chat Window Section */}
        <div className="flex-1 flex flex-col border rounded-lg relative" style={{ height: chatHeight }}>
          {connectionState !== "connected" && (
            <div className="absolute inset-0 bg-gray-100 bg-opacity-40 cursor-not-allowed flex justify-center items-center z-10">
              {/* Message for the overlay */}
            </div>
          )}
          <ChatMessages
            handleSendMessage={handleSendMessage}
            messages={messages}
          />
        </div>
      </div>
    </div>
  );
}

export default App;