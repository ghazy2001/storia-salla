import React from "react";
import { useDispatch } from "react-redux";
import { toggleTheme } from "./store/slices/uiSlice";
import { Provider } from "react-redux";
import { store } from "./store/store";

// Components
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import PageContent from "./components/layout/PageContent";
import GlobalOverlays from "./components/layout/GlobalOverlays";

// Hooks
import { useAppInitialization } from "./hooks/useAppInitialization";

function AppContent() {
  const { isReady, theme } = useAppInitialization();
  const dispatch = useDispatch();
  // currentPage is accessed by Navbar/PageContent via Redux now.

  return (
    <div className="bg-brand-offwhite text-brand-charcoal min-h-screen font-sans selection:bg-brand-gold selection:text-brand-charcoal flex flex-col relative z-10">
      <GlobalOverlays isReady={isReady} />

      <div
        className={`flex flex-col min-h-screen transition-opacity duration-1000 ease-in-out ${
          isReady ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden={!isReady}
      >
        <Navbar
          theme={theme}
          toggleTheme={() => dispatch(toggleTheme())}
          // Navigation and other handlers are now internal to Navbar using Redux
        />
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
      <AppContent />
    </Provider>
  );
}

export default App;
