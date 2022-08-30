import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

if (import.meta.env.DEV) {
    const showErrorOverlay = (err) => {
        // must be within function call because that's when the element is defined for sure.
        const ErrorOverlay = customElements.get("vite-error-overlay");
        // don't open outside vite environment
        if (!ErrorOverlay) {
            return;
        }
        console.log(err);
        const overlay = new ErrorOverlay(err);
        document.body.appendChild(overlay);
    };

    window.addEventListener("error", (error) => showErrorOverlay(error));
    window.addEventListener("unhandledrejection", (reason) => showErrorOverlay(reason));
}
