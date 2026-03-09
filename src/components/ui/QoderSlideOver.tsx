"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface QoderSlideOverProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export function QoderSlideOver({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    footer,
}: QoderSlideOverProps) {
    const [mounted, setMounted] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            document.body.style.overflow = "hidden";
        } else {
            // 300ms matches the transition duration before unmounting
            const timer = setTimeout(() => {
                setShouldRender(false);
                document.body.style.overflow = "";
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!mounted || !shouldRender) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex justify-end font-[family-name:var(--font-body)]">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"
                    }`}
                onClick={onClose}
            />

            {/* Slide Panel */}
            <div
                className={`relative w-full max-w-md bg-[#050505] border-l border-[#1a1a1a] shadow-2xl shadow-black h-full flex flex-col transform transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Glow effect on the edge */}
                <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#C5A059]/20 to-transparent shadow-[0_0_10px_rgba(197,160,89,0.3)]"></div>

                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between px-6 py-5 border-b border-[#111] bg-[#0A0A0A]">
                    <div>
                        <h2 className="text-xl font-bold font-[family-name:var(--font-rasputin)] tracking-wide text-[#F5F0EB]">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="text-[13px] text-[#8A8A8A] mt-1">{subtitle}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full text-[#8A8A8A] hover:text-white hover:bg-[#1a1a1a] transition-colors"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                    {children}
                </div>

                {/* Footer Area */}
                {footer && (
                    <div className="flex-shrink-0 px-6 py-4 border-t border-[#111] bg-[#0A0A0A]">
                        {footer}
                    </div>
                )}
            </div>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #222;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #333;
        }
      `}</style>
        </div>,
        document.body
    );
}
