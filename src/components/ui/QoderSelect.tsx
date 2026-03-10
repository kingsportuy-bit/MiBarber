"use client";

import React, { SelectHTMLAttributes, forwardRef } from "react";

interface QoderSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string | number; label: string }[];
}

export const QoderSelect = forwardRef<HTMLSelectElement, QoderSelectProps>(
    ({ label, error, options, className = "", ...props }, ref) => {
        return (
            <div className="flex flex-col gap-1.5 w-full">
                {label && (
                    <label className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    <select
                        ref={ref}
                        className={`app-input pr-10 ${error ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : ""
                            } ${className}`}
                        {...props}
                    >
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-black text-white py-2">
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    {/* Custom Chevron Down */}
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#8A8A8A] group-focus-within:text-[#C5A059] transition-colors">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                </div>
                {error && <span className="text-red-400 text-xs mt-0.5">{error}</span>}
            </div>
        );
    }
);

QoderSelect.displayName = "QoderSelect";
