import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { Provider } from "react-redux";
import store from "./app/store.js";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
    </Provider>
  </StrictMode>
);
