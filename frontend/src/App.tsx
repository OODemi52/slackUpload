import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import LandingPage from "./components/LandingPage";
import AuthCallback from "./components/AuthCallback";
import AuthContext from "./context/AuthContext";

const queryClient = new QueryClient();

function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const brodChannel = new BroadcastChannel('auth_channel');
  
    brodChannel.onmessage = (event) => {
      if (event.data.type === 'auth-success') {
        setAccessToken(event.data.accessToken);
        console.log("Received access token via BroadcastChannel.");
      }
    };
  
    return () => {
      brodChannel.close();
    };
  }, []);

  useEffect(() => {
    const refreshAccessToken = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_SERVERPROTOCOL}://${import.meta.env.VITE_SERVERHOST}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "ngrok-skip-browser-warning": "true"
          },
        });
  
        if (!response.ok) {
          throw new Error('Refresh token request failed. Try signing in again.');
        }
  
        const data = await response.json();
  
        if (data.accessToken) {
          setAccessToken(data.accessToken);
        }
      } catch (error) {
        console.error(error);
      }
    };
    
    if (!accessToken) {
      refreshAccessToken();
    }
  }, [accessToken]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ accessToken, setAccessToken }}>
        <Router>
          <Routes>
            <Route path="/" element={accessToken ? <Dashboard /> : <LandingPage />} />
            <Route path="/authCallback" element={<AuthCallback />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

export default App;