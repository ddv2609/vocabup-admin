import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.scss";
import "./styles/_global.scss";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./store.ts";
import TranslationProvider from "./components/TranslationProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <TranslationProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </TranslationProvider>
    </PersistGate>
  </Provider>
);
