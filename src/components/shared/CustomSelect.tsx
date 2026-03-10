"use client";

import React from "react";
import * as Select from "@radix-ui/react-select";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";

interface CustomSelectProps {
    value: string;
    onValueChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export function CustomSelect({
    value,
    onValueChange,
    options,
    placeholder = "Seleccionar...",
    className = "",
    disabled = false,
}: CustomSelectProps) {
    // Radix Select doesn't allow empty string as value for Item.
    // We map "" to a special token and back.
    const internalValue = value === "" ? "__none__" : value;

    const handleValueChange = (val: string) => {
        onValueChange(val === "__none__" ? "" : val);
    };

    return (
        <Select.Root value={internalValue} onValueChange={handleValueChange} disabled={disabled}>
            <Select.Trigger
                className={`flex items-center justify-between w-full h-10 px-3 py-2 text-sm bg-qoder-dark-bg-form border border-qoder-dark-border-primary text-qoder-dark-text-primary focus:outline-none focus:border-qoder-dark-accent-primary transition-colors ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <Select.Value placeholder={placeholder} />
                <Select.Icon>
                    <ChevronDownIcon className="h-4 w-4 text-qoder-dark-text-secondary" />
                </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
                <Select.Content
                    className="overflow-hidden bg-[#1e1f20] border border-qoder-dark-border-primary shadow-xl z-[1001]"
                    position="popper"
                    sideOffset={5}
                >
                    <Select.Viewport className="p-1">
                        {options.map((option) => (
                            <Select.Item
                                key={option.value || "__none__"}
                                value={option.value === "" ? "__none__" : option.value}
                                className="relative flex items-center px-8 py-2 text-sm text-qoder-dark-text-primary cursor-pointer select-none outline-none rounded-none data-[highlighted]:bg-[#C5A059] data-[highlighted]:text-black transition-colors"
                            >
                                <Select.ItemText>{option.label}</Select.ItemText>
                                <Select.ItemIndicator className="absolute left-2 inline-flex items-center justify-center">
                                    <CheckIcon className="h-4 w-4" />
                                </Select.ItemIndicator>
                            </Select.Item>
                        ))}
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    );
}
