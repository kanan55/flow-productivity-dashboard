import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AppProvider } from "./context/AppContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <AppProvider>
            <App />
        </AppProvider>
    </React.StrictMode>
);

// Register Service Worker for PWA support in production only
if (process.env.NODE_ENV === "production") {
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker
                .register(`${process.env.PUBLIC_URL || ""}/service-worker.js`)
                .then((reg) => {
                    console.log("Service Worker registered successfully:", reg.scope);
                })
                .catch((err) => {
                    console.error("Service Worker registration failed:", err);
                });
        });
    }
} else {
    // In development, unregister any active service worker to prevent hot reload loops
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
            for (let registration of registrations) {
                registration.unregister().then((unregistered) => {
                    if (unregistered) {
                        console.log("Service Worker unregistered in development mode.");
                        window.location.reload();
                    }
                });
            }
        });
    }
}
