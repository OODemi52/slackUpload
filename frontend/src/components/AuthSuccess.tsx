import { useEffect } from "react";

const AuthSuccess = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');

    if (accessToken) {
      window.opener.postMessage({ type: 'auth-success', accessToken: accessToken }, window.location.origin);
    }

    window.close();
  }, []);

  return <div>Authentication successful! You can close this window.</div>;
};

export default AuthSuccess;
