"use client";

import React, { InputHTMLAttributes, forwardRef } from "react";

interface QoderInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const QoderInput = forwardRef<HTMLInputElement, QoderInputProps>(
    ({ label, error, icon, className = "", ...props }, ref) => {
        return (
            <div className="flex flex-col gap-1.5 w-full">
                {label && (
                    <label className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">
                        {label}
                    </label>
                )}
                <div className="relative flex items-center group">
                    {icon && (
                        <div className="absolute left-3 text-[#8A8A8A] transition-colors group-focus-within:text-[#C5A059]">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-[10px] py-3 text-white text-[15px] font-[family-name:var(--font-body)] transition-all duration-300 ease-in-out placeholder-[#444] focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/30 hover:border-[#333] ${icon ? "pl-10 pr-4" : "px-4"
                            } ${error ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : ""} ${className}`}
                        {...props}
                    />
                </div>
                {error && <span className="text-red-400 text-xs mt-0.5">{error}</span>}
            </div>
        );
    }
);

QoderInput.displayName = "QoderInput";
