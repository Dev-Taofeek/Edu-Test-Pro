"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Defer state updates to next microtask to avoid cascading renders
        Promise.resolve().then(() => {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
            setLoading(false);
        });
    }, []);

    const login = (userData) => {
        try {
            // Save user to localStorage
            localStorage.setItem("user", JSON.stringify(userData));
            // Update state
            setUser(userData);
            // Redirect based on role
            router.push(
                userData.role === "admin"
                    ? "/dashboard/admin"
                    : "/dashboard/student",
            );
        } catch (error) {
            console.error("Failed to save user to localStorage:", error);
        }
    };

    const logout = () => {
        localStorage.removeItem("user");
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
