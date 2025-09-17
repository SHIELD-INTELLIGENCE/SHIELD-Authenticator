import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Set system bar colors for Capacitor apps (Android)
import { StatusBar, Style } from '@capacitor/status-bar';
import { NavigationBar } from '@capacitor/navigation-bar';

if (window && window.Capacitor) {
  StatusBar.setBackgroundColor({ color: '#caa94c' }); // Gold
  StatusBar.setStyle({ style: Style.Dark }); // or Style.Light if needed
  NavigationBar.setColor({ color: '#caa94c' });
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
