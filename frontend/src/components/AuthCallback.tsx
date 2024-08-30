import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const AuthCallback = () => {
  const location = useLocation();
  const [tokenPassed, setTokenPassed] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get('accessToken');

    if (accessToken) {
      const brodChannel = new BroadcastChannel('auth_channel');
      brodChannel.postMessage({ type: 'auth-success', accessToken });
      console.log('Sent access token via BroadcastChannel');
      brodChannel.close();
      setTokenPassed(true);

      setTimeout(() => {
        if (window.opener) {
          window.opener.location.reload();
          close();
        }
      }, 500);
    }
    
  }, [location]);

  return tokenPassed ? <>Authentication Processed! You Can Close This Window If It Has Not Closed!</> : <>Processing Authentication...</>;
};

export default AuthCallback;
