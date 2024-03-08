import { useState, useEffect } from "react";
import { SignInWithSlack } from "./components/SignInWithSlack";
import Modal from "./components/Modal";
import Dashboard from "./components/Dashboard";
import logo from "./assets/SSLOGO_NOBG.png";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient()

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [user, setUser] = useState(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false);
    }
  }, [isFirstLoad]);

  if (!isAuthenticated) {
    return (
      <>
        <Modal>
          <img src={logo} alt="Slack Shots Logo" className="logo-image" />
          <h1>SlackShots</h1>
          <h3>Click Below To Add The App/Sign Into Your Workspace!</h3>
          <SignInWithSlack />
        </Modal>
      </>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}

export default App;
