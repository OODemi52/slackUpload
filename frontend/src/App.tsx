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

  useEffect(() => {
    const brodChannel = new BroadcastChannel('auth_channel');
  
    brodChannel.onmessage = (event) => {
      if (event.data.type === 'auth-success') {
        setAccessToken(event.data.accessToken);
        console.log("Received access token via BroadcastChannel");
      }
    };
  
    return () => {
      brodChannel.close();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ accessToken, setAccessToken }}>
        <Router>
          <Routes>
            <Route path="/" element={accessToken ? <Dashboard /> : <LandingPage />} />
            <Route path="/auth-callback" element={<AuthCallback />} />
          </Routes>
        </Router>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
