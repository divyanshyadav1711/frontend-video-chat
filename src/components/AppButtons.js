import React from 'react'

const AppButtons = () => {
    return (
        <div className="mt-4 flex gap-4 md:gap-10 items-center justify-center">
            {/* Play Store Button */}
            <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer">
                <img
                    src="/images/play-store-badge.png"
                    alt="Get it on Play Store"
                    className="w-52 h-auto"
                />
            </a>

            {/* App Store Button */}
            <a href="https://www.apple.com/app-store/" target="_blank" rel="noopener noreferrer">
                <img
                    src="/images/app-store-badge.png"
                    alt="Get it on App Store"
                    className="w-40 h-auto"
                />
            </a>
        </div>

    )
}

export default AppButtons
