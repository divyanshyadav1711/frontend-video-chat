import { useState, useRef } from "react";
import { createPeerConnection } from "../components/connection";
// import { createPeerConnection } from "./connection";

const useWebRTC = (stream, sendMessage, resetMessages) => {
    const [callAccepted, setCallAccepted] = useState(false);
    const [connectionState, setConnectionState] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const peerConnection = useRef(null);

    const initializeCall = async () => {
        console.log("[WebRTC] Initializing call...");
        peerConnection.current = createPeerConnection(stream, {
            onTrack: (stream) => {
                console.log("[WebRTC] Remote stream received.");
                setCallAccepted(true);
                setRemoteStream(stream);
            },
            onIceCandidate: (candidate) => {
                if (candidate) {
                    console.log("[WebRTC] ICE candidate generated:", candidate);
                    sendMessage({ type: "ice-candidate", candidate: candidate });
                }
            },
            onConnectionStateChange: (connectionState) => {
                console.log("[WebRTC] Connection state changed:", connectionState);
                setConnectionState(connectionState);
            },
        });

        const offer = await peerConnection.current.createOffer();
        console.log("[WebRTC] Offer created:", offer);
        await peerConnection.current.setLocalDescription(offer);
        console.log("[WebRTC] Local description set.");
        sendMessage({ type: "offer", offer });
        console.log("[WebRTC] Offer sent to remote peer.");
    };

    const handleOffer = async (offer) => {
        console.log("[WebRTC] Received offer:", offer);
        peerConnection.current = createPeerConnection(stream, {
            onTrack: (stream) => {
                console.log("[WebRTC] Remote stream received.");
                setCallAccepted(true);
                setRemoteStream(stream);
            },
            onIceCandidate: (candidate) => {
                if (candidate) {
                    console.log("[WebRTC] ICE candidate generated:", candidate);
                    sendMessage({ type: "ice-candidate", candidate: candidate });
                }
            },
            onConnectionStateChange: (connectionState) => {
                console.log("[WebRTC] Connection state changed:", connectionState);
                setConnectionState(connectionState);
            },
        });

        await peerConnection.current.setRemoteDescription(offer);
        console.log("[WebRTC] Remote description set.");
        const answer = await peerConnection.current.createAnswer();
        console.log("[WebRTC] Answer created:", answer);
        await peerConnection.current.setLocalDescription(answer);
        console.log("[WebRTC] Local description set.");
        sendMessage({ type: "answer", answer });
        console.log("[WebRTC] Answer sent to remote peer.");
    };

    const handleAnswer = async (answer) => {
        console.log("[WebRTC] Received answer:", answer);
        await peerConnection.current.setRemoteDescription(answer);
        console.log("[WebRTC] Remote description set.");
    };

    const handleIceCandidate = async (candidate) => {
        console.log("[WebRTC] Received ICE candidate:", candidate);
        await peerConnection.current.addIceCandidate(candidate);
        console.log("[WebRTC] ICE candidate added.");
    };

    const endCallCleanup = () => {
        console.log("[WebRTC] Cleaning up call...");
        resetMessages();
        setCallAccepted(false);
        if (peerConnection.current) {
            peerConnection.current.close();
            console.log("[WebRTC] Peer connection closed.");
            setConnectionState(null);
            peerConnection.current = null;
        }
    };

    return {
        remoteStream,
        callAccepted,
        connectionState,
        initializeCall,
        handleOffer,
        handleAnswer,
        handleIceCandidate,
        endCallCleanup,
    };
};

export default useWebRTC;