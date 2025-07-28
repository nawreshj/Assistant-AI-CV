// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import App from "./App.jsx";
import system from "./system.js";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <ChakraProvider value={system || defaultSystem}>
            <NextThemesProvider attribute="class" disableTransitionOnChange>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </NextThemesProvider>
        </ChakraProvider>
    </React.StrictMode>
);
