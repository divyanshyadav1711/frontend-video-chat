import React from "react";
import LoadingSpinner from "./LoadingSpinner";
import NoiseCanvas from "./NoiseCanvas";
import AppButtons from "./AppButtons";

const VideoStreams = ({
    loadingLocalStream,
    connected,
    connectionState,
    localVideoRef,
    remoteVideoRef,
}) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2">
            {/* Local Video */}
            <div id="#local-video-container" className="relative w-full bg-black aspect-[1/1] md:aspect-[4/3]">
                {loadingLocalStream && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <LoadingSpinner />
                    </div>
                )}
                <video
                    id="localVideo"
                    ref={localVideoRef}
                    playsInline
                    muted
                    autoPlay
                    className="w-full object-cover h-full transform scale-x-[-1]"
                />
            </div>

            {/* Remote Video */}
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
                <video
                    ref={remoteVideoRef}
                    playsInline
                    autoPlay
                    className="w-full h-full object-cover transform scale-x-[-1]"
                />
            </div>
        </div>
    );
};

export default VideoStreams;