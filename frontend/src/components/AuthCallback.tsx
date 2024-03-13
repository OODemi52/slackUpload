import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const AuthCallback = () => {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get('accessToken');

    if (accessToken) {
      const brodChannel = new BroadcastChannel('auth_channel');
      brodChannel.postMessage({ type: 'auth-success', accessToken });
      console.log('Sent access token via BroadcastChannel');
      brodChannel.close();
    }

    window.close();
  }, [location]);

  return <div>Processing authentication...</div>;
};

export default AuthCallback;
