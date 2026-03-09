"use client";

import React, { forwardRef } from "react";

interface QoderSwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
    label?: string;
    description?: string;
    onCheckedChange?: (checked: boolean) => void;
    checked?: boolean;
}

export const QoderSwitch = forwardRef<HTMLInputElement, QoderSwitchProps>(
    ({ label, description, checked, onCheckedChange, onChange, className = "", ...props }, ref) => {

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (onChange) onChange(e);
            if (onCheckedChange) onCheckedChange(e.target.checked);
        };

        return (
            <label className={`flex items-start gap-4 cursor-pointer group ${className}`}>
                {/* The actual hidden input */}
                <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={checked}
                    onChange={handleChange}
                    ref={ref}
                    {...props}
                />

                {/* The iOS-style pill shape */}
                <div className="relative mt-0.5 inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-[#C5A059] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-black bg-[#222] peer-checked:bg-[#C5A059]">

                    {/* The thumb circle */}
                    <span
                        className={`pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${checked ? "translate-x-[20px]" : "translate-x-0"
                            }`}
                    />
                </div>

                {/* Text Container */}
                {(label || description) && (
                    <div className="flex flex-col select-none">
                        {label && (
                            <span className={`text-[15px] font-medium font-[family-name:var(--font-body)] transition-colors ${checked ? 'text-white' : 'text-[#e5e5e5]'}`}>
                                {label}
                            </span>
                        )}
                        {description && (
                            <span className="text-[13px] text-[#8A8A8A] font-[family-name:var(--font-body)] mt-0.5 leading-snug">
                                {description}
                            </span>
                        )}
                    </div>
                )}
            </label>
        );
    }
);

QoderSwitch.displayName = "QoderSwitch";
