import PopUpCleaner from "@/components/PopUp";
import { Play } from "lucide-react";

export default function PlaySpeedPopup({ open, close, playSpeed, setPlaySpeed, locale }) {
    if (!open) return null;

    const speedOptions = [1, 2, 4, 8, 16];
    const currentIndex = speedOptions.indexOf(playSpeed);

    const handleSliderChange = (event) => {
        const index = parseInt(event.target.value);
        setPlaySpeed(speedOptions[index]);
    };

    return (
        <>
            <PopUpCleaner open={open} close={close} />
            <div className="fixed inset-0 z-[9999] pointer-events-none" style={{ direction: 'ltr' }}>
                <div className={`absolute bg-white shadow-xl rounded-xs p-6 pt-4 border border-gray-200 pointer-events-auto ${locale === 'heb' ? 'bottom-8 right-8' : 'bottom-8 left-8'}`}>
                    <div className="w-64 bg-white rounded-sm text-sm">
                        <div className="text-sm font-semibold mb-4 font-['Geist'] flex justify-start items-start">
                            Autoplay Playback speed
                        </div>

                        <div className="mb-1">
                            <div className="relative">
                                <div className="flex items-center">
                                    <span className="text-xs text-gray-400 font-['Geist'] w-[30px] text-left">slow</span>
                                    <input
                                        type="range"
                                        min="0"
                                        max={speedOptions.length - 1}
                                        value={currentIndex}
                                        onChange={handleSliderChange}
                                        className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider mx-1"
                                        style={{
                                            background: `linear-gradient(to right, #9ca3af 0%, #9ca3af ${(currentIndex / (speedOptions.length - 1)) * 100}%, #e5e7eb ${(currentIndex / (speedOptions.length - 1)) * 100}%, #e5e7eb 100%)`
                                        }}
                                    />
                                    <span className="text-xs text-gray-400 font-['Geist'] w-[30px] text-right">fast</span>
                                </div>
                                {/* Speed indicators removed - keeping only slow/fast labels */}
                                {/* <div className="flex items-center mt-1 mb-4">
                                    <div className="w-[30px]"></div>
                                    <div className="flex-1 relative">
                                        {speedOptions.map((speed, index) => {
                                            const isFirst = index === 0;
                                            const isLast = index === speedOptions.length - 1;
                                            const position = (index / (speedOptions.length - 1)) * 100;

                                            return (
                                                <div
                                                    key={speed}
                                                    className="absolute flex flex-col items-center text-xs text-gray-300 font-mono"
                                                    style={{
                                                        left: `${position}%`,
                                                        transform: 'translateX(-50%)'
                                                    }}
                                                >
                                                    <div className={`w-1 h-1 rounded-full mb-1 ${index === currentIndex ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                                    <span className={index === currentIndex ? 'text-gray-700 font-medium' : ''}>{speed}x</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="w-[30px]"></div>
                                </div> */}
                            </div>
                        </div>


                    </div>
                </div>
            </div>

            <style jsx>{`
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    height: 10px;
                    width: 10px;
                    border-radius: 50%;
                    background: #9ca3af;
                    cursor: pointer;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }

                .slider::-moz-range-thumb {
                    height: 10px;
                    width: 10px;
                    border-radius: 50%;
                    background: #9ca3af;
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }
            `}</style>
        </>
    );
}