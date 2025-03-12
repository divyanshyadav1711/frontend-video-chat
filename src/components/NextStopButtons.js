import React from "react";

const NextStopButtons = ({
  connected, connecting,
  connectionState, connectWebSocket,
  disconnectWebSocket, nextConnection
}) => {
  return (
    <>
      <div className="w-full md:w-1/2 grid grid-cols-3 gap-4 p-4">
        {!connected && connectionState !== 'connected' && (
          <button
            onClick={connectWebSocket}
            disabled={connecting}
            className={`px-4 py-2 rounded-xl bg-green-100 text-green-600 border transition-all duration-200 ${connecting
              ? "border-gray-400 text-gray-400 cursor-not-allowed"
              : "border-green-500 hover:scale-[1.02] hover:text-green-600 cursor-pointer"
              }`}
          >
            Start
          </button>
        )}
        {(connected || connectionState === 'connected') && (
          <>
            <button
              onClick={nextConnection}
              disabled={connectionState !== "connected"}
              className={`px-4 py-2 rounded-xl bg-green-100  border transition-all duration-200 ${connectionState !== "connected"
                ? "border-gray-400 bg-gray-200 text-gray-400 scale-[0.98] cursor-not-allowed"
                : "border-green-500 text-green-600 hover:scale-[1.01] hover:text-green-600 cursor-pointer"
                }`}
            >
              Next
            </button>
          </>
        )}
        <button
          onClick={disconnectWebSocket}
          disabled={!connected}
          className={`px-4 py-2 rounded-xl border transition-all duration-200 ${!connected
            ? "border-gray-400 bg-gray-200 text-gray-400 cursor-not-allowed scale-[0.98]"
            : "border-red-500 bg-red-100 text-red-600 hover:scale-[1.01] hover:text-red-500 cursor-pointer"
            }`}
        >
          Stop
        </button>
        <div className="flex items-center justify-center">
          {connected && connectionState === "connected" && (
            <span className="text-green-500">Connected</span>
          )}
          {connected && connectionState !== "connected" && (
            <span className="text-sm text-gray-400">Searching for new user...</span>
          )}
          {!connected && (
            <span className="text-sm text-gray-400">Press Start to connect</span>
          )}
        </div>
      </div>

    </>
  );
};

export default NextStopButtons;