import { useState, useRef, useEffect } from "react";

const PING_INTERVAL = 45000; // 45 seconds

const useWebSocket = (url, handlers) => {
    const [connected, setConnected] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const ws = useRef(null);
    let pingIntervalId = useRef(null);

    const connectWebSocket = () => {
        setConnecting(true);
        ws.current = new WebSocket(url);

        ws.current.onopen = () => {
            console.log("[WebSocket] Connected to signaling server.");
            setConnecting(false);
            setConnected(true);
            startPingPong();
            if (handlers.onOpen) handlers.onOpen();
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (handlers.onMessage) handlers.onMessage(data);
        };

        ws.current.onclose = () => {
            stopPingPong();
            console.error("[WebSocket] WebSocket connection closed...");
            setConnected(false);
            setConnecting(false);
            if (handlers.onClose) handlers.onClose();
        };

        ws.current.onerror = (error) => {
            console.error("[WebSocket] WebSocket error:", error);
            setConnected(false);
            setConnecting(false);
            if (handlers.onError) handlers.onError(error);
        };
    };

    const disconnect = () => {
        if (ws.current) {
            ws.current.close();
            ws.current = null;
        }
        setConnected(false);
        setConnecting(false);
    };

    const sendMessage = (message) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(message));
        }
    };
    const startPingPong = () => {
        // Start sending pings every 45 seconds
        pingIntervalId.current = setInterval(() => {
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                console.log("[WebSocket] Sending ping...");
                // ws.current.send(JSON.stringify({ type: "ping" }));
                sendMessage({ type: "ping" });

            }
        }, PING_INTERVAL);
    };

    const stopPingPong = () => {
        // Stop sending pings and clear any timeouts
        console.log("[WebSocket] Stopping ping/pong...");
        if (pingIntervalId.current) clearInterval(pingIntervalId.current);
        // if (pongTimeoutId) clearTimeout(pongTimeoutId);
    };

    useEffect(() => {
        return () => {
            disconnect();
        };
    }, []);

    return { ws, connected, connecting, connectWebSocket, disconnect, sendMessage, setConnected, setConnecting };
};

export default useWebSocket;