
import * as React from 'react';

interface SuccessOverlayProps {
    isOpen: boolean;
    message: string;
}

const SuccessOverlay: React.FC<SuccessOverlayProps> = ({ isOpen, message }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex flex-col items-center justify-center z-50 transition-opacity duration-300" role="alert" aria-live="assertive">
            <style>{`
                .tick-circle {
                    stroke-dasharray: 166;
                    stroke-dashoffset: 166;
                    animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
                }
                .tick-check {
                    transform-origin: 50% 50%;
                    stroke-dasharray: 48;
                    stroke-dashoffset: 48;
                    animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
                }
                @keyframes stroke {
                    100% {
                        stroke-dashoffset: 0;
                    }
                }
                .tick-container {
                    animation: scale 0.3s ease-in-out 0.9s both;
                }
                @keyframes scale {
                    0%, 100% {
                        transform: none;
                    }
                    50% {
                        transform: scale3d(1.1, 1.1, 1);
                    }
                }
                .success-message {
                    animation: fadeIn 0.5s ease-in-out 1s forwards;
                    opacity: 0;
                }
                @keyframes fadeIn {
                    100% {
                        opacity: 1;
                    }
                }
            `}</style>
            <div className="tick-container">
                <svg className="h-72 w-72" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                    <circle className="tick-circle" cx="26" cy="26" r="25" fill="none" stroke="#0ea5e9" strokeWidth="2" />
                    <path className="tick-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" />
                </svg>
            </div>
            <p className="mt-10 text-5xl font-semibold text-white success-message">{message}</p>
        </div>
    );
};

export default SuccessOverlay;