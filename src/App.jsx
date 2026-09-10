import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';
import ChatWidget from './components/chatbot/ChatWidget';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ChatWidget />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
