"use client";
import { createContext, useContext, useState } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [activeExamId, setActiveExamId] = useState(null);
    const [examResults, setExamResults] = useState(null);

    const logout = () => {
        setUser(null);
        setActiveExamId(null);
        setExamResults(null);
    };

    return (
        <UserContext.Provider
            value={{
                user,
                setUser,
                activeExamId,
                setActiveExamId,
                examResults,
                setExamResults,
                logout,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within UserProvider");
    return context;
}
