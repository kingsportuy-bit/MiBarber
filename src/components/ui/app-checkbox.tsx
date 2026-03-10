"use client";

import React from "react";
import { motion } from "framer-motion";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: React.ReactNode;
    description?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className = "", label, description, checked, onChange, disabled, ...props }, ref) => {
        return (
            <label
                className={`group relative flex items-start gap-3 cursor-pointer select-none ${disabled ? "opacity-50 cursor-not-allowed" : ""
                    } ${className}`}
            >
                <div className="relative flex items-center justify-center mt-0.5">
                    <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={checked}
                        onChange={onChange}
                        disabled={disabled}
                        ref={ref}
                        {...props}
                    />
                    <motion.div
                        initial={false}
                        animate={{
                            backgroundColor: checked ? "#C5A059" : "transparent",
                            borderColor: checked ? "#C5A059" : "rgba(197, 160, 89, 0.4)",
                        }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="w-5 h-5 rounded-[4px] border border-[rgba(197,160,89,0.4)] bg-transparent shadow-sm flex items-center justify-center transition-shadow group-hover:shadow-[0_0_8px_rgba(197,160,89,0.3)] peer-focus-visible:ring-2 peer-focus-visible:ring-[#C5A059] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#0a0a0a]"
                    >
                        <motion.svg
                            initial={false}
                            animate={{ opacity: checked ? 1 : 0, scale: checked ? 1 : 0.5 }}
                            transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 20 }}
                            className="w-3.5 h-3.5 text-black"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </motion.svg>
                    </motion.div>
                </div>
                {(label || description) && (
                    <div className="flex flex-col">
                        {label && (
                            <span className={`text-[14px] font-medium font-[family-name:var(--font-body)] transition-colors duration-200 ${checked ? 'text-white' : 'text-[#8a8a8a] group-hover:text-white'}`}>
                                {label}
                            </span>
                        )}
                        {description && (
                            <span className="text-[12px] text-[#555] font-[family-name:var(--font-body)] mt-0.5">
                                {description}
                            </span>
                        )}
                    </div>
                )}
            </label>
        );
    }
);
Checkbox.displayName = "Checkbox";
