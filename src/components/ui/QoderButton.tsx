"use client";

import React, { ButtonHTMLAttributes, forwardRef } from "react";

export interface QoderButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "ghost";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const QoderButton = forwardRef<HTMLButtonElement, QoderButtonProps>(
    (
        {
            children,
            variant = "primary",
            size = "md",
            isLoading = false,
            leftIcon,
            rightIcon,
            className = "",
            disabled,
            ...props
        },
        ref
    ) => {
        const baseStyles =
            "relative inline-flex items-center justify-center gap-2 font-[family-name:var(--font-body)] font-medium transition-all duration-300 ease-out active:scale-[0.98] outline-none disabled:opacity-50 disabled:pointer-events-none rounded-[10px] overflow-hidden";

        const variants = {
            primary: "app-btn-primary",
            secondary:
                "bg-[#111] text-[#F5F0EB] border border-[#222] hover:border-[#C5A059]/50 hover:bg-[#1a1a1a]",
            danger:
                "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40",
            ghost:
                "bg-transparent text-[#8A8A8A] hover:text-[#C5A059] hover:bg-[#C5A059]/10",
        };

        const sizes = {
            sm: "h-9 px-4 text-xs",
            md: "h-11 px-6 text-[14px]",
            lg: "h-14 px-8 text-base",
        };

        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                {...props}
            >
                {isLoading ? (
                    <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : leftIcon}

                <span className="relative z-10">{children}</span>

                {!isLoading && rightIcon}
            </button>
        );
    }
);

QoderButton.displayName = "QoderButton";
