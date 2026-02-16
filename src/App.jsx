import React from "react";
import { useDispatch } from "react-redux";
import { toggleTheme } from "./store/slices/uiSlice";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { HashRouter } from "react-router-dom";

// Components
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import PageContent from "./components/layout/PageContent";
import GlobalOverlays from "./components/layout/GlobalOverlays";

// Hooks
import { useAppInitialization } from "./hooks/useAppInitialization";

function AppContent() {
  const { theme } = useAppInitialization();
  const dispatch = useDispatch();

  return (
    <div className="bg-brand-offwhite text-brand-charcoal min-h-screen font-sans selection:bg-brand-gold selection:text-brand-charcoal flex flex-col relative z-10 transition-colors duration-500">
      <GlobalOverlays />

      <div className="flex flex-col min-h-screen">
        <Navbar theme={theme} toggleTheme={() => dispatch(toggleTheme())} />
        <main className="flex-grow">
          <PageContent />
        </main>
        <Footer theme={theme} />
      </div>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </Provider>
  );
}

export default App;
