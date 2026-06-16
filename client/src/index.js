import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AppProvider } from "./context/AppContext";
import ErrorBoundary from "./components/ErrorBoundary";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <AppProvider>
            <ErrorBoundary>
                <App />
            </ErrorBoundary>
        </AppProvider>
    </React.StrictMode>
);

// Register Service Worker for PWA support in production only
if (process.env.NODE_ENV === "production") {
    // Clear old flow-cache-v1 programmatically to fix mobile caching issues
    if ("caches" in window) {
        caches.keys().then((names) => {
            for (let name of names) {
                if (name === "flow-cache-v1") {
                    caches.delete(name).then(() => {
                        console.log("Programmatically deleted old cache:", name);
                        window.location.reload();
                    });
                }
            }
        });
    }

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
