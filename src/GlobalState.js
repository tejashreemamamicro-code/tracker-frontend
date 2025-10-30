// GlobalState.js

import React, { createContext, useState, useEffect } from "react";

const GlobalState = createContext([{}, () => { }]);

export const GlobalStateProvider = ({ children }) => {
    // Function to safely parse stored data
    function loadPersistedState() {
        try {
            const storedState = localStorage.getItem("globalState");
            return storedState ? JSON.parse(storedState) : { loggedUser: null };
        } catch (err) {
            console.error("Error parsing stored state:", err);
            return { loggedUser: null };
        }
    }

    // Initialize state with persistent state from localStorage
    const [state, setState] = useState(loadPersistedState);
    const [loading, setLoading] = useState(true);

    // On first mount, ensure localStorage is synced
    useEffect(() => {
        const stored = localStorage.getItem("globalState");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setState(parsed);
            } catch (err) {
                console.error("Failed to parse persisted global state", err);
                setState({ loggedUser: null });
            }
        }
        setLoading(false);
    }, []);

    // Persist state to localStorage on every change
    useEffect(() => {
        if (!loading) {
            try {
                localStorage.setItem("globalState", JSON.stringify(state));
            } catch (err) {
                console.error("Failed to persist global state", err);
            }
        }
    }, [state, loading]);

    // Helper: always keep loggedUser accessible directly
    useEffect(() => {
        if (!state.loggedUser) {
            const storedUser = localStorage.getItem("loggedUser");
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setState((prev) => ({ ...prev, loggedUser: parsedUser }));
                } catch (err) {
                    console.error("Error restoring loggedUser:", err);
                }
            }
        }
    }, [state.loggedUser]);

    return (
        <GlobalState.Provider value={[state, setState]}>
            {children}
        </GlobalState.Provider>
    );
};

export default GlobalState;
