// src/App.tsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { LayoutProvider } from './context/LayoutContext';
import AppRoutes from './routes/cdn_users';

const App: React.FC = () => {
  return (
    <LayoutProvider>
      <BrowserRouter>
        <div className="App" id="app">
          <AppRoutes />
        </div>
      </BrowserRouter>
    </LayoutProvider>
  );
};

export default App;