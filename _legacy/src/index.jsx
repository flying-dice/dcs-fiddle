import "@fontsource/ibm-plex-sans";
import "@fontsource/ibm-plex-mono";
import React from "react";
import ReactDOM from "react-dom/client";
import { NotificationsProvider } from "@mantine/notifications";
import { MantineProvider } from "@mantine/core";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { EnvironmentContextProvider } from "./context/environment";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        colorScheme: "dark",
        fontFamily: "IBM Plex Sans",
        fontFamilyMonospace: "IBM Plex Mono",
      }}
    >
      <NotificationsProvider>
        <EnvironmentContextProvider>
          <App />
        </EnvironmentContextProvider>
      </NotificationsProvider>
    </MantineProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
