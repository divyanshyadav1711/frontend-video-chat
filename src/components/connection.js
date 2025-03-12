
const iceServers = [
  
    {
      url: 'stun:global.stun.twilio.com:3478',
      urls: 'stun:global.stun.twilio.com:3478'
    },
    {
      credential: '2nn4Oh7vkl/edxcc33YaL0wmct2XRjxCKbEV2mIuHd8=',
      url: 'turn:global.turn.twilio.com:3478?transport=udp',
      urls: 'turn:global.turn.twilio.com:3478?transport=udp',
      username: '6b2ef60835d57397b55bc522e906de145c610f265ff16757ecc3e05363472231'
    },
    {
      credential: '2nn4Oh7vkl/edxcc33YaL0wmct2XRjxCKbEV2mIuHd8=',
      url: 'turn:global.turn.twilio.com:3478?transport=tcp',
      urls: 'turn:global.turn.twilio.com:3478?transport=tcp',
      username: '6b2ef60835d57397b55bc522e906de145c610f265ff16757ecc3e05363472231'
    },
    {
      credential: '2nn4Oh7vkl/edxcc33YaL0wmct2XRjxCKbEV2mIuHd8=',
      url: 'turn:global.turn.twilio.com:443?transport=tcp',
      urls: 'turn:global.turn.twilio.com:443?transport=tcp',
      username: '6b2ef60835d57397b55bc522e906de145c610f265ff16757ecc3e05363472231'
    }
  

];

// const connectionStates = [
//   "new",
//   "connecting",
//   "connected",
//   "disconnected",
//   "failed",
//   "closed",
// ];

export const createWebSocketConnection = (serverUrl, handlers) => {
  console.log("[WebSocket] Initializing WebSocket connection to", serverUrl);

  const ws = new WebSocket(serverUrl);

  ws.onopen = () => {
    console.log("[WebSocket] Connection established to", serverUrl);
  };

  ws.onmessage = (event) => {
    // console.log("[WebSocket] Message received:", event.type);
    const data = JSON.parse(event.data);
    handlers?.onMessage?.(data);
  };

  ws.onerror = (error) => {
    console.error("[WebSocket] Error occurred:", error);
  };

  ws.onclose = () => {
    console.warn("[WebSocket] Connection closed");
    handlers?.onClose?.();
  };

  return ws;
};

export const createPeerConnection = (stream, handlers) => {
  console.log("[WebRTC] Creating PeerConnection with ICE servers:", iceServers);
  const configuration = {
    iceServers,
    // iceTransportPolicy: "relay"
  }
  const peerConnection = new RTCPeerConnection(configuration);

  if (stream) {
    console.log("[WebRTC] Adding local stream tracks to PeerConnection");
    stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));
  }

  peerConnection.ontrack = (event) => {
    console.log("[WebRTC] Remote track received");
    if (event.streams[0]) {
      handlers?.onTrack?.(event.streams[0]);
    }
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("[WebRTC] ICE candidate generated:", event.candidate);
      handlers?.onIceCandidate?.(event.candidate);
    }
  };

  peerConnection.onconnectionstatechange = () => {
    console.log("[WebRTC] Connection state changed to:", peerConnection.connectionState);
    handlers?.onConnectionStateChange?.(peerConnection.connectionState);
  };

  return peerConnection;
};
