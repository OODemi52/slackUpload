import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import LandingPage from "./components/LandingPage";
import AuthCallback from "./components/AuthCallback";
import AuthContext from "./context/AuthContext";

const queryClient = new QueryClient();

function App() {
  const [accessToken, setAccessToken] = useState<string | null>("");
  const [isTokenProcessed, setIsTokenProcessed] = useState(false);

  useEffect(() => {
    const brodChannel = new BroadcastChannel('auth_channel');
  
    brodChannel.onmessage = (event) => {
      if (event.data.type === 'auth-success' && !isTokenProcessed) {
        setAccessToken(event.data.accessToken);
        console.log("Received access token via BroadcastChannel.");
        setIsTokenProcessed(true);
        window.location.reload();
      }
    };
  
    return () => {
      brodChannel.close();
    };
  }, [isTokenProcessed]);

  useEffect(() => {
    const refreshAccessToken = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_SERVERPROTOCOL}://${import.meta.env.VITE_SERVERHOST}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
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
    refreshAccessToken();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ accessToken, setAccessToken }}>
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/authCallback" element={<AuthCallback />} /> 
          </Routes>
        </Router>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

export default App;