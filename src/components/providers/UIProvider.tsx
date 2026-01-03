"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface UIContextType {
    isStickyNav: boolean;
    setStickyNav: (value: boolean) => void;
    toggleStickyNav: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
    const [isStickyNav, setIsStickyNav] = useState(true);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("niko-sticky-nav");
        if (saved !== null) {
            setIsStickyNav(saved === "true");
        }
    }, []);

    const setStickyNav = (value: boolean) => {
        setIsStickyNav(value);
        localStorage.setItem("niko-sticky-nav", value.toString());
    };

    const toggleStickyNav = () => {
        setStickyNav(!isStickyNav);
    };

    return (
        <UIContext.Provider value={{ isStickyNav, setStickyNav, toggleStickyNav }}>
            {children}
        </UIContext.Provider>
    );
}

export function useUI() {
    const context = useContext(UIContext);
    if (context === undefined) {
        throw new Error("useUI must be used within a UIProvider");
    }
    return context;
}
