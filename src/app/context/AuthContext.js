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

    // Fetch complete user information from your backend
    const fetchCompleteUserData = async (userId, token) => {
        try {
            const response = await fetch(`/api/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error("Failed to fetch user data");

            const userData = await response.json();
            return userData;
        } catch (error) {
            console.error("Failed to fetch complete user data:", error);
            throw error;
        }
    };

    const setAuthUser = async (userData) => {
        try {
            // If userData has a token/id, fetch complete information from backend
            let completeUserData = userData;

            if (userData.id && userData.token) {
                try {
                    completeUserData = await fetchCompleteUserData(
                        userData.id,
                        userData.token,
                    );
                } catch (error) {
                    console.warn(
                        "Could not fetch full user data, using provided data:",
                        error,
                    );
                    completeUserData = userData;
                }
            }

            // Store the complete user data
            localStorage.setItem("user", JSON.stringify(completeUserData));
            setUser(completeUserData);

            const targetPath =
                completeUserData.role === "admin"
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
