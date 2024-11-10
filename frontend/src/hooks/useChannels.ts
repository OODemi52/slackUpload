import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";

type APIChannelRepsonse = { 
    id: string; 
    name: string; 
    isMember: boolean; 
  };

const fetchChannels = async (accessToken: string | null) => {
    const response = await fetch(`${import.meta.env.VITE_SERVERPROTOCOL}://${import.meta.env.VITE_SERVERHOST}/api/getChannels`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
    }

    const channels = await response.json();

    return channels.map((channel: APIChannelRepsonse) => ({
        value: channel.id,
        label: channel.name,
        isMember: channel.isMember,
    }));
};

export const useChannels = () => {
    const { accessToken } = useContext(AuthContext);

    return useQuery({
        queryKey: ['channels'],
        queryFn: () => fetchChannels(accessToken),
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 30,
    });
};