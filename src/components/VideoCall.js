// import React, { useRef, useEffect, useState } from "react";
// import io from "socket.io-client";

// const url = "ws://localhost:8080"; // URL of your signaling server
// // const url = "https://n4ww7.sse.codesandbox.io/webrtcPeer"; // URL of your signaling server

// export default function App() {
//   const localStreamRef = useRef(null);
//   const remoteStreamRef = useRef(null);
//   const textAreaRef = useRef(null);
//   const [socket, setSocket] = useState(null);
//   const [candidates, setCandidates] = useState([]);

//   useEffect(() => {
//     // Create socket connection
//     const socketConnection = io.connect(url);

//     socketConnection.on("connection-success", (data) => {
//       console.log(data.message); // Logging successful connection
//     });

//     socketConnection.on("offerOrAnswer", (sdp) => {
//       textAreaRef.current.value = JSON.stringify(sdp);
//     });

//     socketConnection.on("candidate", (candidate) => {
//       setCandidates((prevCandidates) => [...prevCandidates, candidate]);
//     });

//     // Save socket connection for sending messages
//     setSocket(socketConnection);

//     // Handle ICE Candidate events
//     const pc = new RTCPeerConnection({
//       iceServers: [
//         {
//           urls: "stun:stun.l.google.com:19320", // Google's public STUN server
//         },
//       ],
//     });

//     // Add the local stream to the peer connection
//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         console.log("Sending candidate:", event.candidate);
//         socketConnection.emit("candidate", event.candidate);
//       }
//     };

//     pc.ontrack = (event) => {
//       remoteStreamRef.current.srcObject = event.streams[0];
//     };

//     // Get the local video stream from the user's webcam
//     const constraints = {
//       video: true,
//     };

//     navigator.mediaDevices
//       .getUserMedia(constraints)
//       .then((stream) => {
//         localStreamRef.current.srcObject = stream;
//         stream.getTracks().forEach((track) => pc.addTrack(track, stream));
//       })
//       .catch((err) => {
//         console.log("Error accessing media devices:", err);
//       });

//     return () => {
//       // Clean up on component unmount
//       socketConnection.disconnect();
//       pc.close();
//     };
//   }, []);

//   const onOffer = () => {
//     console.log("Creating Offer");
//     socket.emit("offerOrAnswer", { type: "offer" });

//     // Create an offer SDP and send it to the signaling server
//     const pc = new RTCPeerConnection({
//       iceServers: [
//         {
//           urls: "stun:stun.l.google.com:19320",
//         },
//       ],
//     });

//     pc.createOffer({ offerToReceiveVideo: 1 }).then(
//       (sdp) => {
//         console.log("SDP Offer created:", sdp);
//         pc.setLocalDescription(sdp);
//         socket.emit("offerOrAnswer", sdp); // Send the offer to the other peer
//       },
//       (error) => console.error("Error creating offer:", error)
//     );
//   };

//   const onAnswer = () => {
//     console.log("Creating Answer");
//     socket.emit("offerOrAnswer", { type: "answer" });

//     // Create an answer SDP and send it to the signaling server
//     const pc = new RTCPeerConnection({
//       iceServers: [
//         {
//           urls: "stun:stun.l.google.com:19320",
//         },
//       ],
//     });

//     pc.createAnswer({ offerToReceiveVideo: 1 }).then(
//       (sdp) => {
//         console.log("SDP Answer created:", sdp);
//         pc.setLocalDescription(sdp);
//         socket.emit("offerOrAnswer", sdp); // Send the answer to the other peer
//       },
//       (error) => console.error("Error creating answer:", error)
//     );
//   };

//   const onSetRemoteDesc = () => {
//     const desc = textAreaRef.current.value;
//     const pc = new RTCPeerConnection({
//       iceServers: [
//         {
//           urls: "stun:stun.l.google.com:19320",
//         },
//       ],
//     });

//     console.log("Setting Remote Description");
//     pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(desc)));
//   };

//   const onAddCandidate = () => {
//     candidates.forEach((candidate) => {
//       console.log("Adding ICE Candidate", candidate);
//       const pc = new RTCPeerConnection({
//         iceServers: [
//           {
//             urls: "stun:stun.l.google.com:19320",
//           },
//         ],
//       });
//       pc.addIceCandidate(new RTCIceCandidate(candidate));
//     });
//   };

//   return (
//     <div className="App">
//       <h1>WebRTC Signaling with Socket.IO</h1>
//       <p>
//         1. P1: create Offer <br />
//         3. P2: setRemoteDesc <br />
//         4. P2: create Answer <br />
//         6. P1: setRemoteDesc <br />
//         7. P1: add Candidate <br />
//       </p>
//       <video
//         ref={localStreamRef}
//         autoPlay
//         muted
//         style={{
//           width: 200,
//           height: 200,
//           margin: 5,
//           backgroundColor: "black",
//         }}
//       />
//       <video
//         ref={remoteStreamRef}
//         autoPlay
//         style={{
//           width: 200,
//           height: 200,
//           margin: 5,
//           backgroundColor: "black",
//         }}
//       />
//       <br />
//       <button onClick={onOffer}>Offer</button>
//       <button onClick={onAnswer}>Answer</button>
//       <br />
//       <textarea ref={textAreaRef} style={{ width: "100%", height: 150 }} />
//       <br />
//       <button onClick={onSetRemoteDesc}>Set Remote Desc</button>
//       <button onClick={onAddCandidate}>Add Candidate</button>
//     </div>
//   );
// }

// ----------------------#################################################################################
// WORKING -------------#########

// import React, { useState, useRef } from "react";
// import Peer from "simple-peer";
// import io from "socket.io-client";

// const socket = io("https://socket2-cv8a.onrender.com");

// function App() {
//   const [stream, setStream] = useState(null);
//   const [me, setMe] = useState("");
//   const [callAccepted, setCallAccepted] = useState(false);
//   const [callEnded, setCallEnded] = useState(false);
//   const [caller, setCaller] = useState("");
//   const [callerSignal, setCallerSignal] = useState(null);
//   const [receivingCall, setReceivingCall] = useState(false);

//   const myVideo = useRef();
//   const userVideo = useRef();
//   const connectionRef = useRef();

//   React.useEffect(() => {
//     navigator.mediaDevices
//       .getUserMedia({ video: true, audio: true })
//       .then((stream) => {
//         setStream(stream);
//         if (myVideo.current) myVideo.current.srcObject = stream;
//       });

//     socket.on("me", (id) => {
//       console.log('socket id ', id)
//       setMe(id);
//     });

//     socket.on("callUser", (data) => {
//       setReceivingCall(true);
//       setCaller(data.from);
//       setCallerSignal(data.signal);
//     });
//   }, []);

//   const callUser = (id) => {
//     const peer = new Peer({
//       initiator: true,
//       trickle: false,
//       stream: stream,
//     });

//     peer.on("signal", (data) => {
//       console.log(data);

//       socket.emit("callUser", {
//         userToCall: id,
//         signalData: data,
//         from: me,
//       });
//     });

//     peer.on("stream", (stream) => {
//       userVideo.current.srcObject = stream;
//     });

//     socket.on("callAccepted", (signal) => {
//       setCallAccepted(true);
//       peer.signal(signal);
//     });

//     connectionRef.current = peer;
//   };

//   const answerCall = () => {
//     setCallAccepted(true);
//     const peer = new Peer({
//       initiator: false,
//       trickle: false,
//       stream: stream,
//     });

//     peer.on("signal", (data) => {
//       socket.emit("answerCall", { signal: data, to: caller });
//     });

//     peer.on("stream", (stream) => {
//       userVideo.current.srcObject = stream;
//     });

//     peer.signal(callerSignal);
//     connectionRef.current = peer;
//   };

//   const leaveCall = () => {
//     setCallEnded(true);
//     connectionRef.current.destroy();
//   };

//   return (
//     <div>
//     <h1>Hello</h1>
//       <div>
//         {stream && <video playsInline muted ref={myVideo} autoPlay />}
//         {callAccepted && !callEnded && (
//           <video playsInline ref={userVideo} autoPlay />
//         )}
//       </div>
//       <div>
//         <input
//           type="text"
//           value={me}
//           readOnly
//           style={{ width: "100%", marginBottom: "10px" }}
//         />
//         <button onClick={() => callUser(prompt("Enter ID to call"))}>
//           Call User
//         </button>
//         {receivingCall && !callAccepted && (
//           <div>
//             <h1>{caller} is calling...</h1>
//             <button onClick={answerCall}>Answer</button>
//           </div>
//         )}
//         <button onClick={leaveCall}>End Call</button>
//       </div>
//     </div>
//   );
// }

// export default App;

// -----------------------------------------------------------------------------
// ########################## Auto connect working #############################

// import React, { useState, useRef, useEffect } from "react";
// import Peer from "simple-peer";
// import io from "socket.io-client";

// // const socket = io("http://localhost:5000");
// const socket = io("https://socket2-cv8a.onrender.com");

// function App() {
//   const [stream, setStream] = useState(null);
//   const [me, setMe] = useState("");
//   const [callAccepted, setCallAccepted] = useState(false);
//   const [callEnded, setCallEnded] = useState(false);
//   const [caller, setCaller] = useState("");
//   const [callerSignal, setCallerSignal] = useState(null);
//   const [receivingCall, setReceivingCall] = useState(false);
//   const [otherClientSocketId, setOtherClientSocketId] = useState("");
//   const [isInitiator, setIsInitiator] = useState(false); // Track if this user should initiate the call

//   const myVideo = useRef();
//   const userVideo = useRef(null);
//   const connectionRef = useRef();

//   useEffect(() => {
//     // Get user's media stream
//     navigator.mediaDevices
//       .getUserMedia({ video: true, audio: true })
//       .then((stream) => {
//         setStream(stream);
//         if (myVideo.current) myVideo.current.srcObject = stream;
//       });

//     // Get the current user's socket ID
//     socket.on("me", (id) => {
//       setMe(id);
//     });

//     // Listen for the socket ID of the other client
//     socket.on("receiveSocketId", (socketId) => {
//       setOtherClientSocketId(socketId);
//     });

//     // Listen for the initiator flag
//     socket.on("isInitiator", (initiatorStatus) => {
//       setIsInitiator(initiatorStatus);
//     });

//     // Handle incoming call
//     socket.on("callUser", (data) => {
//       setReceivingCall(true);
//       setCaller(data.from);
//       setCallerSignal(data.signal);
//       // Automatically answer the call if this is the second user
//       // if (!isInitiator) {
//       //   answerCall();
//       // }
//     });

//   }, [isInitiator]);

//   useEffect(() => {
//     if(caller && callerSignal && !isInitiator){
//       answerCall();
//     }
//   },[callerSignal,caller])

//   useEffect(() => {
//     if (me && otherClientSocketId && isInitiator) {
//       const peer = new Peer({
//         initiator: true,
//         trickle: false,
//         stream: stream,
//       });

//       peer.on("signal", (data) => {
//         console.log('caling user');

//         socket.emit("callUser", {
//           userToCall: otherClientSocketId,
//           signalData: data,
//           from: me,
//         });
//       });

//       peer.on("stream", (stream) => {
//         userVideo.current.srcObject = stream;
//       });

//       peer.on("error", (error) => {
//         console.error("Peer connection error:", error);
//       });

//       peer.on("connect", () => {
//         console.log("Peer connection established.");
//       });

//       socket.on("callAccepted", (signal) => {
//         setCallAccepted(true);
//         peer.signal(signal);  // Make sure to signal after the call is accepted
//       });

//       connectionRef.current = peer;
//     }
//   }, [me, otherClientSocketId, isInitiator]);

//   const answerCall = () => {
//     console.log('answering call');
//     setCallAccepted(true);
//     const peer = new Peer({
//       initiator: false,
//       trickle: false,
//       stream: stream,
//     });

//     peer.on("signal", (data) => {
//       socket.emit("answerCall", { signal: data, to: caller });
//     });

//     peer.on("stream", (stream) => {
//       userVideo.current.srcObject = stream;
//     });

//     // Ensure the connection is established before signaling
//     if (callerSignal) {
//       peer.signal(callerSignal);
//     } else {
//       console.error("Caller signal data is not available.");
//     }

//     connectionRef.current = peer;
//   };

//   const leaveCall = () => {
//     setCallEnded(true);
//     if (connectionRef.current) {
//       connectionRef.current.destroy();
//     }
//   };

//   return (
//     <div>
//       <h1>Video Call</h1>
//       <div>
//         {stream && <video playsInline muted ref={myVideo} autoPlay />}
//         {!callAccepted && <h4>Connecting...</h4>}
//         {callAccepted && !callEnded && <video playsInline ref={userVideo} autoPlay />}
//       </div>
//       <div>
//         {/* <input
//           type="text"
//           value={me}
//           readOnly
//           style={{ width: "100%", marginBottom: "10px" }}
//         /> */}
//         {callAccepted && !callEnded && (
//           <button onClick={leaveCall}>End Call</button>
//         )}
//       </div>
//     </div>
//   );
// }

// export default App;

// #####################################################################
// WORKING with native RTPC


// import React, { useState, useEffect, useRef } from "react";
// import { io } from "socket.io-client";

// const serverUrl = "http://localhost:5000"; // Replace with your Socket.IO server URL

// function App() {
//   const [stream, setStream] = useState(null);
//   const [me, setMe] = useState("");
//   const [callAccepted, setCallAccepted] = useState(false);
//   const [callEnded, setCallEnded] = useState(false);
//   const [isInitiator, setIsInitiator] = useState(false);
//   const [startCallMessage, setStartCallMessage] = useState(""); // Message to start call
//   const [inCall, setInCall] = useState(false); // Track if user is in a call

//   const myVideo = useRef(null);
//   const userVideo = useRef(null);
//   const peerConnection = useRef(null);
//   const socket = useRef(null);

//   useEffect(() => {
//     // Initialize Socket.IO connection
//     socket.current = io(serverUrl);

//     socket.current.on("connect", () => {
//       console.log("Connected to server");
//     });

//     socket.current.on("connect-data", (data) => {
//       setMe(data.userId);
//       setIsInitiator(data.isInitiator);
//     });

//     socket.current.on("start-call", (data) => {
//       console.log("Received start call message: ", data.message);
//       setTimeout(() => {
//         initializeCall();
//       }, 1000);
//     });

//     socket.current.on("offer", async (data) => {
//       console.log("Got the offer ", data);

//       if (!peerConnection.current) {
//         createPeerConnection();
//       }
//       await peerConnection.current.setRemoteDescription(
//         new RTCSessionDescription(data.offer)
//       );
//       const answer = await peerConnection.current.createAnswer();
//       await peerConnection.current.setLocalDescription(answer);
//       socket.current.emit("answer", { answer });
//     });

//     socket.current.on("answer", async (data) => {
//       console.log("Got the answer");

//       await peerConnection.current.setRemoteDescription(
//         new RTCSessionDescription(data.answer)
//       );
//     });

//     socket.current.on("ice-candidate", async (data) => {
//       console.log("Got the ice candidate");

//       if (data.candidate) {
//         try {
//           await peerConnection.current.addIceCandidate(
//             new RTCIceCandidate(data.candidate)
//           );
//         } catch (e) {
//           console.error("Error adding ICE candidate:", e);
//         }
//       }
//     });

//     socket.current.on("peer-disconnected", () => {
//       setInCall(false);
//       setCallAccepted(false);
//       setCallEnded(true);
//       if (peerConnection.current) {
//         peerConnection.current.close();
//         peerConnection.current = null;
//       }
//     });

//     // Get user's media stream
//     navigator.mediaDevices
//       .getUserMedia({ video: true, audio: true })
//       .then((stream) => {
//         setStream(stream);
//         if (myVideo.current) myVideo.current.srcObject = stream;
//       })
//       .catch((err) => console.error("Error accessing media devices:", err));

//     return () => {
//       socket.current?.disconnect();
//       stream?.getTracks().forEach((track) => track.stop());
//       peerConnection.current?.close();
//     };
//   }, []);

//   useEffect(() => {
//     createPeerConnection();
//     if (isInitiator && stream) {
//       createPeerConnection();
//     }
//   }, [isInitiator, stream]);

//   const createPeerConnection = () => {
//     // console.log('Creating peer connection again.........');

//     const configuration = {
//       iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//     };

//     peerConnection.current = new RTCPeerConnection(configuration);

//     stream?.getTracks().forEach((track) => {
//       peerConnection.current.addTrack(track, stream);
//     });

//     peerConnection.current.ontrack = (event) => {
//       console.log("Pc on track", event);

//       if (event.streams[0]) {
//         console.log("Remote stream received:", event.streams[0]);

//         // Check if userVideo ref is available
//         if (userVideo.current) {
//           userVideo.current.srcObject = event.streams[0];
//         } else {
//           console.error("userVideo ref is not available.");
//         }
//       } else {
//         console.error("No remote stream received.");
//       }
//     };

//     peerConnection.current.onicecandidate = (event) => {
//       if (event.candidate) {
//         socket.current.emit("ice-candidate", { candidate: event.candidate });
//       }
//     };

//     peerConnection.current.onconnectionstatechange = () => {
//       console.log(peerConnection.current.connectionState);

//       if (peerConnection.current.connectionState === "connected") {
//         console.log('Connceted again..........');

//         setCallAccepted(true);
//         setInCall(true);
//       }
//     };
//   };

//   const initializeCall = async () => {
//     if (!peerConnection.current) createPeerConnection();
//     console.log("initializing call");

//     try {
//       const offer = await peerConnection.current.createOffer();
//       await peerConnection.current.setLocalDescription(offer);
//       socket.current.emit("offer", { offer });
//     } catch (err) {
//       console.error("Error creating offer:", err);
//     }
//   };

//   const leaveCall = () => {
//     setCallEnded(true);
//     setInCall(false);
//     if (peerConnection.current) {
//       peerConnection.current.close();
//     }
//     if (stream) {
//       stream.getTracks().forEach((track) => track.stop());
//     }
//   };

//   const handleNext = () => {
//     setCallEnded(true);
//     setInCall(false);
//     socket.current.emit("next");
//     if (peerConnection.current) {
//       peerConnection.current.close();
//       peerConnection.current = null;
//     }
//   };

//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold mb-4">Video Call</h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {stream && (
//           <div style={{ display: 'flex' }} className="relative">
//             <video
//               playsInline
//               muted
//               width={500}
//               height={500}
//               ref={myVideo}
//               autoPlay
//               className="w-full rounded-lg"
//             />
//             <p className="mt-2">Your Video</p>
//             <video
//               width={500}
//               height={500}
//               muted
//               ref={userVideo}
//               autoPlay
//             />
//           </div>
//         )}
//         {!callAccepted && <h4 className="text-gray-500">Searching for new user...</h4>}

//       </div>
//       <div className="mt-4">
//         {startCallMessage && (
//           <button
//             onClick={initializeCall}
//             className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
//           >
//             Start Call
//           </button>
//         )}
//         {callAccepted && (
//           <>
//             {/* <button
//                 onClick={leaveCall}
//                 className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
//               >
//                 End Call
//               </button> */}
//             <button
//               onClick={handleNext}
//               className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors ml-2"
//               disabled={!inCall}
//             >
//               Next
//             </button>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// export default App;



// import React, { useState, useEffect, useRef } from "react";

// // const serverUrl = "ws://localhost:5000/ws"; // Replace with your WebSocket server URL
// const serverUrl = "ws://20.244.33.130:5000/ws"; // Replace with your WebSocket server URL
// const candidates = []

// function App() {
//   const [stream, setStream] = useState(null);
//   const [me, setMe] = useState("");
//   const [callAccepted, setCallAccepted] = useState(false);
//   const [callEnded, setCallEnded] = useState(false);
//   const [isInitiator, setIsInitiator] = useState(false);
//   const [startCallMessage, setStartCallMessage] = useState("");
//   const [inCall, setInCall] = useState(false);
//   const [pc, setPc] = useState(null);

//   const myVideo = useRef(null);
//   const userVideo = useRef(null);
//   const peerConnection = useRef(null);
//   const ws = useRef(null);

//   console.log("Candidates List .... ", candidates);

//   useEffect(() => {
//     if (stream) {
//       createPeerConnection();
//     }
//   }, [stream])

//   useEffect(() => {
//     // Initialize WebSocket connection

//     ws.current = new WebSocket(serverUrl);



//     ws.current.onopen = () => {
//       console.log("Connected to WebSocket server");
//     };

//     ws.current.onmessage = (event) => {
//       const data = JSON.parse(event.data);

//       switch (data.type) {
//         case "connect-data":
//           setMe(data.userId);
//           setIsInitiator(data.isInitiator);
//           break;
//         case "start-call":
//           console.log("Received start call message:", data.message);
//           setTimeout(() => {
//             initializeCall();
//           }, 3000);
//           break;
//         case "offer":
//           handleOffer(data.offer);
//           break;
//         case "answer":
//           handleAnswer(data.answer);
//           break;
//         case "ice-candidate":
//           handleIceCandidate(data.candidate);
//           break;
//         case "peer-disconnected":
//           endCallCleanup();
//           break;
//         default:
//           console.log("Unknown message type:", data.type);
//       }
//     };

//     ws.current.onerror = (error) => {
//       console.error("WebSocket error:", error);
//     };

//     ws.current.onclose = () => {
//       console.log("WebSocket connection closed");
//     };

//     // Get user's media stream
//     navigator.mediaDevices
//       .getUserMedia({ video: true, audio: true })
//       .then((stream) => {
//         setStream(stream);
//         if (myVideo.current) myVideo.current.srcObject = stream;
//       })
//       .catch((err) => console.error("Error accessing media devices:", err));

//     return () => {
//       ws.current?.close();
//       stream?.getTracks().forEach((track) => track.stop());
//       peerConnection.current?.close();
//     };
//   }, []);

//   const createPeerConnection = () => {
//     console.log('Creating peer connection');
//     // const iceServers = [
//     //   // { urls: "stun:stun.l.google.com:19302" }, // STUN server
//     //   {
//     //     urls: 'turn:20.244.33.130:3478',  // Your TURN server address
//     //     username: 'Abhi@17112105',        // Your TURN username
//     //     credential: 'your_secret_key'     // Your TURN password (the static-auth-secret you set)
//     // },
//     //   // {
//     //   //   urls: "turns:your-turn-server.com:5349", // TURN with TLS
//     //   //   username: "username",
//     //   //   credential: "password"
//     //   // }
//     // ];
//     const iceServers= [
//       // {
//       //   urls: 'stun:global.stun.twilio.com:3478'
//       // },
//       { urls: "stun:stun.l.google.com:19302" },
//       {
//         urls: 'turn:global.turn.twilio.com:3478?transport=udp',
//         username: 'a3a0053d23c64a701151c5cad1a19de2618162c57eb253355bba13297beee573',
//         credential: 'DGNS5I2CNgo4yDXuWUrkMIJyzITcwfdo7mr1Vc34DMU='
//       },
//       // {
//       //   urls: 'turn:global.turn.twilio.com:3478?transport=tcp',
//       //   username: 'a3a0053d23c64a701151c5cad1a19de2618162c57eb253355bba13297beee573',
//       //   credential: 'DGNS5I2CNgo4yDXuWUrkMIJyzITcwfdo7mr1Vc34DMU='
//       // },
//       // {
//       //   urls: 'turn:global.turn.twilio.com:443?transport=tcp',
//       //   username: 'a3a0053d23c64a701151c5cad1a19de2618162c57eb253355bba13297beee573',
//       //   credential: 'DGNS5I2CNgo4yDXuWUrkMIJyzITcwfdo7mr1Vc34DMU='
//       // }
//     ];
//     const configuration = {
//       iceServers,
//       // iceTransportPolicy: "relay"
//       // iceServers: [
//       //   { urls: 'stun:stun.l.google.com:19302' }, // Primary STUN server
//       //   { urls: 'stun:stun1.l.google.com:19302' }, // Alternative 1
//       //   { urls: 'stun:stun2.l.google.com:19302' }, // Alternative 2
//       //   { urls: 'stun:stun3.l.google.com:19302' }, // Alternative 3
//       //   { urls: 'stun:stun4.l.google.com:19302' },
//       // ]
//     };

//     peerConnection.current = new RTCPeerConnection(configuration);
//     console.log("Peer Connection.. ", peerConnection.current);

//     stream?.getTracks().forEach((track) => {
//       peerConnection.current.addTrack(track, stream);
//     });

//     peerConnection.current.ontrack = (event) => {
//       if (event.streams[0] && userVideo.current) {
//         userVideo.current.srcObject = event.streams[0];
//       }
//     };

//     peerConnection.current.onicecandidate = (event) => {
//       console.log("ice candidate event ", event);
//       candidates.push(event.candidate)
//       console.log("Candidate List...",candidates)
//       if (event.candidate) {
//         ws.current.send(
//           JSON.stringify({ type: "ice-candidate", candidate: event.candidate })
//         );
//       }
//     };

//     peerConnection.current.onconnectionstatechange = () => {
//       console.log('Connection state chaged ', peerConnection.current.connectionState);
//       console.log('Connection state chaged ', peerConnection.current);

//       if (peerConnection.current.connectionState === "connected") {
//         setCallAccepted(true);
//         setInCall(true);
//       }
//       if (peerConnection.current.connectionState === "failed") {
//         // initializeCall();
//       }

//     };
//   };

//   function disconnectWebRTC() {
//     // Close the peer connection
//     if (peerConnection.current) {
//       peerConnection.current.close();
//       peerConnection.current = null;
//     }

//     // Stop the local media stream
//     // if (localStream) {
//     //     localStream.getTracks().forEach((track) => track.stop());
//     // }

//     // Clear the remote video element
//     // const remoteVideo = document.getElementById('remoteVideo');
//     // if (remoteVideo) {
//     //     remoteVideo.srcObject = null;
//     // }

//     // Close any active data channels
//     // if (dataChannel) {
//     //     dataChannel.close();
//     // }

//     console.log("WebRTC connection disconnected.");
//   }

//   const initializeCall = async () => {
//     console.log("initalizing call");

//     if (!peerConnection.current) createPeerConnection();

//     try {
//       const offer = await peerConnection.current.createOffer();
//       console.log('Offer created ', offer);
//       await peerConnection.current.setLocalDescription(new RTCSessionDescription(offer));
//       ws.current.send(JSON.stringify({ type: "offer", offer }));
//     } catch (err) {
//       console.error("Error creating offer:", err);
//     }
//   };

//   const handleOffer = async (offer) => {
//     console.log("Handling offer... ", offer);

//     if (!peerConnection.current) createPeerConnection();
//     try {
//       await peerConnection.current.setRemoteDescription(
//         new RTCSessionDescription(offer)
//       );
//       const answer = await peerConnection.current.createAnswer();
//       await peerConnection.current.setLocalDescription(answer);
//       ws.current.send(JSON.stringify({ type: "answer", answer }));
//     } catch (err) {
//       console.error("Error handling offer:", err);
//     }
//   };

//   const handleAnswer = async (answer) => {
//     console.log("Handling answer ", answer);
//     try {
//       await peerConnection.current.setRemoteDescription(
//         new RTCSessionDescription(answer)
//       );
//     } catch (err) {
//       console.error("Error handling answer:", err);
//     }
//   };

//   const handleIceCandidate = async (candidate) => {
//     console.log('Handling ice candidate ');

//     try {
//       await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
//     } catch (err) {
//       console.error("Error adding ICE candidate:", err);
//     }
//   };

//   const endCallCleanup = () => {
//     setInCall(false);
//     setCallAccepted(false);
//     setCallEnded(true);
//     if (peerConnection.current) {
//       peerConnection.current.close();
//       peerConnection.current = null;
//     }
//   };

//   const leaveCall = () => {
//     endCallCleanup();
//     if (stream) {
//       stream.getTracks().forEach((track) => track.stop());
//     }
//   };

//   const handleNext = () => {
//     endCallCleanup();
//     ws.current.send(JSON.stringify({ type: "next" }));
//   };

//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold mb-4">Video Call</h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {true && (
//           <div style={{ display: "flex" }} className="relative">
//             <video
//               playsInline
//               muted
//               ref={myVideo}
//               autoPlay
//               className="w-full rounded-lg"
//             />
//             <p className="mt-2">Your Video</p>
//             <video ref={userVideo} autoPlay  />
//           </div>
//         )}
//         {!callAccepted && (
//           <h4 className="text-gray-500">Searching for new user...</h4>
//         )}
//       </div>
//       <div className="mt-4">
//         {startCallMessage && (
//           <button
//             onClick={initializeCall}
//             className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
//           >
//             Start Call
//           </button>
//         )}
//         {callAccepted && (
//           <button
//             onClick={handleNext}
//             className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors ml-2"
//             disabled={!inCall}
//           >
//             Next
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

// export default App;


import React, { useState, useRef, useEffect } from "react";
import { createWebSocketConnection, createPeerConnection } from "./connection";
import LoadingSpinner from "./LoadingSpinner";
import NoiseCanvas from "./NoiseCanvas";
import ChatMessages from "./ChatMessages";
import NextStopButtons from "./NextStopButtons";
import AppButtons from "./AppButtons";

// const serverUrl = "ws://20.244.33.130:5000/ws";
const serverUrl = process.env.REACT_APP_SERVER_URL;
const PING_INTERVAL = 45000; // 45 seconds
const PONG_TIMEOUT = 10000; // 10 seconds
let pongTimeoutId = null;
function App() {
  const [stream, setStream] = useState(null);
  const [loadingLocalStream, setLoadingLocalStream] = useState(true);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatHeight, setChatHeight] = useState(0);

  const [connectionState, setConnectionState] = useState(null);
  const [localImage, setLocalImage] = useState(null);
  const [peerImage, setPeerImage] = useState(null);

  const ws = useRef(null);
  const peerConnection = useRef(null);
  const myVideo = useRef(null);
  const userVideo = useRef(null);
  const videoContainerRef = useRef(null);
  let pingIntervalId = useRef(null);

  const handleResize = () => {
    if (videoContainerRef.current) {
      const videoHeight = videoContainerRef.current.offsetHeight;
      const windowHeight = window.innerHeight;
      const remainingHeight = windowHeight - videoHeight;
      setChatHeight(remainingHeight);
    }
  };

  useEffect(() => {
    handleResize(); // Calculate on mount
    window.addEventListener("resize", handleResize); // Recalculate on resize
    return () => {
      window.removeEventListener("resize", handleResize);
      stopPingPong();
    };
  }, []);

  useEffect(() => {
    console.log("Connection State: ", connectionState);
    console.log("Web Socket State: ", connected);

    if (connectionState === 'failed' && connected) {
      console.log("Connection failed, calling nextConnection()");

      // nextConnection();
    }
    if (connectionState === 'connected' && !connected) {
      // nextConnection();
      console.log('Connectdfsded again..........');
    }
  }, [connectionState, connected])

  const handleSendMessage = (inputMessage, clearMessage) => {
    if (!inputMessage || inputMessage?.trim() === "") return;
    ws.current.send(JSON.stringify({ type: "chat", data: inputMessage }));
    setMessages((prev) => [...prev, { type: "me", text: inputMessage }]);
    clearMessage();
  };

  const handleReceiveMessage = (message) => {
    setMessages((prev) => [
      ...prev,
      { type: "user", text: message },
    ]);
  };

  const startPingPong = () => {
    // Start sending pings every 45 seconds
    pingIntervalId.current = setInterval(() => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        console.log("[WebSocket] Sending ping...");
        ws.current.send(JSON.stringify({ type: "ping" }));

      }
    }, PING_INTERVAL);
  };

  const stopPingPong = () => {
    // Stop sending pings and clear any timeouts
    console.log("[WebSocket] Stopping ping/pong...");
    if (pingIntervalId.current) clearInterval(pingIntervalId.current);
    // if (pongTimeoutId) clearTimeout(pongTimeoutId);
  };

  const captureLocalImage = () => {
    const video = document.getElementById('localVideo');
    const canvas = document.createElement('canvas');
    canvas.width = 160; // Set the width to a low pixel value
    canvas.height = 120; // Set the height to a low pixel value
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.5); // Convert to base64 with low quality
    setLocalImage(dataUrl);
    // sendImageToPeer(dataUrl);
  };

  const initializeStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(stream);
      setLoadingLocalStream(false);
      if (myVideo.current) myVideo.current.srcObject = stream;
    } catch (err) {
      console.error("Error accessing media devices:", err);
      setLoadingLocalStream(false);
    }
  };

  const connectWebSocket = () => {
    setConnecting(true);
    // ws.current = createWebSocketConnection("ws://localhost:5000/ws", {
    ws.current = createWebSocketConnection(serverUrl, {
      onMessage: handleWebSocketMessage,
      onClose: handleWebSocketClose,
    });

    ws.current.onopen = () => {
      console.log("[WebSocket] Connected to signaling server.");
      startPingPong();
      setConnecting(false);
      setConnected(true);
    };
  };


  const handleWebSocketMessage = (data) => {
    console.log("[WebSocket] Received message:", data.type);

    switch (data.type) {
      case "start-call":
        initializeCall();
        break;
      case "offer":
        handleOffer(data.offer);
        break;
      case "answer":
        handleAnswer(data.answer);
        break;
      case "ice-candidate":
        handleIceCandidate(data.candidate);
        break;
      case "peer-disconnected":
        handlePeerDisconnected();
        break;
      case "pong":
        console.log("[WebSocket] Received pong.");
        break;
      case "chat":
        handleReceiveMessage(data.data);
        break;
      default:
        console.log("[WebSocket] Unknown message type:", data.type);
    }
  };

  const handleWebSocketClose = () => {
    console.error("[WebSocket] WebSocket connection closed...");
    stopPingPong();
    setConnected(false);
    setConnecting(false);
    endCallCleanup();
  };

  const initializeCall = async () => {
    console.log("Initializing call......");
    peerConnection.current = createPeerConnection(stream, {
      onTrack: (remoteStream) => {
        if (userVideo.current) userVideo.current.srcObject = remoteStream;
        setCallAccepted(true);
      },
      onIceCandidate: (candidate) => {
        if (candidate) {
          ws.current.send(
            JSON.stringify({ type: "ice-candidate", candidate: candidate })
          );
        }
      },
      onConnectionStateChange: (connectionState) => {
        setConnectionState(connectionState)
      },
    });

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    ws.current.send(JSON.stringify({ type: "offer", offer }));
  };

  const handleOffer = async (offer) => {
    peerConnection.current = createPeerConnection(stream, {
      onTrack: (remoteStream) => {
        if (userVideo.current) userVideo.current.srcObject = remoteStream;
        setCallAccepted(true);
      },
      onIceCandidate: (candidate) => {
        if (candidate) {
          ws.current.send(
            JSON.stringify({ type: "ice-candidate", candidate: candidate })
          );
        }
      },
      onConnectionStateChange: (connectionState) => {
        setConnectionState(connectionState)
      },
    });

    await peerConnection.current.setRemoteDescription(offer);
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);
    ws.current.send(JSON.stringify({ type: "answer", answer }));
  };

  const handleAnswer = async (answer) => {
    await peerConnection.current.setRemoteDescription(answer);
  };

  const handleIceCandidate = async (candidate) => {
    await peerConnection.current.addIceCandidate(candidate);
  };

  const resetMessages = () => setMessages([]);

  const disconnectWebSocket = () => {
    // ws.current.send(JSON.stringify({ type: "disconnecting" }));
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    setConnected(false);
    setConnecting(false);
    endCallCleanup();
  };

  const nextConnection = () => {
    console.log("Next Connection..");
    // if web socket is connected, send next message
    setConnecting(true);
    endCallCleanup();
    if (ws.current) {
      console.log("[WebSocket] Sending next message to websocket...");
      ws.current.send(JSON.stringify({ type: "next" }));
    } else {
      console.log("Web Socket is not connected");
      connectWebSocket();
    }
  };

  const handlePeerDisconnected = () => {
    // nextConnection();
    endCallCleanup();
    if (ws.current) {
      console.log("[Websocket] Sending ready message after Peer disconnction");
      ws.current.send(JSON.stringify({ type: "ready" }));
    } else {
      console.log("Web Socket is not connected");
      connectWebSocket();
    }
  }

  const endCallCleanup = () => {
    resetMessages();
    setCallAccepted(false);
    if (peerConnection.current) {
      peerConnection.current.close();
      // setConnectionState(peerConnection.current.connectionState);
      console.log("[WebRtc] Connection state after closing connection:", peerConnection.current.connectionState)
      setConnectionState(null);
      peerConnection.current = null;
    }
  };

  useEffect(() => {
    initializeStream();
    return () => {
      disconnectWebSocket();
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div className="flex flex-col sm:h-screen">
      {/* Video Streams */}
      <div ref={videoContainerRef} className="grid grid-cols-1 sm:grid-cols-2">
        <div id="#local-video-container" className="relative w-full bg-black aspect-[1/1] md:aspect-[4/3]">
          {loadingLocalStream && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <LoadingSpinner />
            </div>
          )}

          <video
            id="localVideo"
            ref={myVideo}
            playsInline
            muted
            autoPlay
            className="w-full object-cover h-full transform scale-x-[-1]"
          />
        </div>

        <div id="#remote-video-container" className="relative w-full bg-gray-600 aspect-[1/1] md:aspect-[4/3]">
          {(!connected || connectionState !== 'connected') && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <NoiseCanvas />
            </div>
          )}
          {(!connected && connectionState !== 'connected') && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <AppButtons />
            </div>
          )}
          {(connected && connectionState !== 'connected') && (
            <div className="absolute inset-0 text-gray-300 flex items-center justify-center z-10">
              Searching for new user...
            </div>
          )}
          {/* {localImage && <img src={localImage} alt="Local Capture" />} */}
          <video
            ref={userVideo}
            playsInline
            autoPlay
            className="w-full h-full object-cover transform scale-x-[-1]"
          />
        </div>
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
          {/* Overlay when not connected */}
          {connectionState !== "connected" && (
            <div className="absolute inset-0 bg-gray-100 bg-opacity-40 cursor-not-allowed flex justify-center items-center z-10">
              {/* Message for the overlay */}
            </div>
          )}

          {/* Chat Messages */}
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
