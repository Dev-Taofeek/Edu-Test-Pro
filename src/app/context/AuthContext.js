"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        Promise.resolve().then(() => {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
            setLoading(false);
        });
    }, []);

    const setAuthUser = (userData) => {
        try {
            localStorage.setItem("user", JSON.stringify(userData));
            setUser(userData);
            const targetPath =
                userData.role === "admin"
                    ? "/dashboard/admin"
                    : "/dashboard/student";

            router.push(targetPath);
            router.refresh();
        } catch (error) {
            console.error("Failed to save user to localStorage:", error);
            throw new Error("Failed to authenticate user");
        }
    };

    const login = setAuthUser;

    const logout = () => {
        localStorage.removeItem("user");
        setUser(null);
        router.push("/login");
        router.refresh();
    };

    return (
        <AuthContext.Provider
            value={{ user, setAuthUser, login, logout, loading }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
