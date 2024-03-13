import { createContext } from "react";

interface AuthContextProps {
    accessToken: string | null;
    setAccessToken: (accessToken: string | null) => void;
}

const AuthContext = createContext<AuthContextProps>({
    accessToken: null,
    setAccessToken: () => {},
});

export default AuthContext;
