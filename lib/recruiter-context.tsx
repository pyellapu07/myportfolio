"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface RecruiterContextType {
  isRecruiterMode: boolean;
  toggleRecruiterMode: () => void;
  setRecruiterMode: (value: boolean) => void;
  hasSeenSplash: boolean;
  markSplashSeen: () => void;
}

const RecruiterContext = createContext<RecruiterContextType>({
  isRecruiterMode: false,
  toggleRecruiterMode: () => { },
  setRecruiterMode: () => { },
  hasSeenSplash: false,
  markSplashSeen: () => { },
});

export function RecruiterProvider({ children }: { children: ReactNode }) {
  const [isRecruiterMode, setIsRecruiterMode] = useState(false);
  const [hasSeenSplash, setHasSeenSplash] = useState(false);

  // No localStorage persistence to ensure fresh start on reload

  const toggleRecruiterMode = () => {
    setIsRecruiterMode((prev) => !prev);
  };

  const setRecruiterMode = (value: boolean) => {
    setIsRecruiterMode(value);
  };

  const markSplashSeen = () => {
    setHasSeenSplash(true);
  };

  return (
    <RecruiterContext.Provider
      value={{
        isRecruiterMode,
        toggleRecruiterMode,
        setRecruiterMode,
        hasSeenSplash,
        markSplashSeen
      }}
    >
      {children}
    </RecruiterContext.Provider>
  );
}

export function useRecruiter() {
  return useContext(RecruiterContext);
}
