# Storia - Luxury Abaya E-Commerce

A premium React-based e-commerce application for a luxury Abaya brand, featuring a sophisticated UI, dynamic theming, and a centralized state management system.

## 🌟 Features

- **Premium UI/UX**: Custom animations with GSAP, smooth transitions, and a responsive glassmorphism design.
- **Dynamic Theming**: Global "Green" and "Burgundy" themes that adapt across components.
- **Centralized State**: Redux Toolkit manages global UI state (modals, toasts, themes) and Cart state.
- **Global Overlays**: Centralized management of Modals, Toast notifications, and Loading screens.
- **Optimized Navigation**: Browser history synchronization and deep linking support.

## 🛠 Tech Stack

- **Framework**: [React](https://reactjs.org/) (Vite)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [GSAP](https://greensock.com/gsap/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📂 Project Structure

```
src/
├── components/
│   ├── admin/       # Admin dashboard and login components
│   ├── common/      # Reusable UI components (Buttons, Inputs, Toasts)
│   ├── layout/      # Layout components (Navbar, Footer, GlobalOverlays)
│   └── ...          # Feature-specific components
├── hooks/           # Custom hooks (e.g., useAppInitialization)
├── store/           # Redux store configuration
│   └── slices/      # Redux slices (uiSlice, cartSlice, adminSlice)
├── utils/           # Helper functions and constants
└── App.jsx          # Main application entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/storia.git
    cd storia
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Run the development server:**

    ```bash
    npm run dev
    ```

4.  **Build for production:**
    ```bash
    npm run build
    ```

## 🧩 Key Concepts

### Global Overlays

All application-wide overlays (Toasts, Modals, Loading Screens) are managed in `src/components/layout/GlobalOverlays.jsx`. This component listens to the Redux `uiSlice` to determine visibility, preventing z-index issues and simplifying component trees.

### Redux Slices

- **`uiSlice`**: Manages visual state (Theme, Toast visibility, Modal open/close).
- **`cartSlice`**: Manages shopping cart state (Add/Remove items, Total calculation).
- **`adminSlice`**: Manages admin authentication and dashboard visibility.

### Theming

The application uses a `theme` state in Redux. Components subscribe to this state to conditionally render styles (e.g., changing from Emerald Green to Deep Burgundy).

## 🤝 Contributing

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
