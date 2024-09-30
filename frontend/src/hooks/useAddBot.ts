import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";

interface AddBotResponse {
  message: string;
}

const addBotToChannel = async (channelId: string, accessToken: string | null): Promise<AddBotResponse> => {
    const response = await fetch(`${import.meta.env.VITE_SERVERPROTOCOL}://${import.meta.env.VITE_SERVERHOST}/api/addBotToChannel`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ channelId }),
    });

    if (!response.ok) {
        throw new Error(`Error posting to addBotToChannel endpoint: ${response.statusText}`);
    }

    return response.json();
};

export const useAddBot = () => {
    const queryClient = useQueryClient();
    const { accessToken } = useContext(AuthContext);

    return useMutation<AddBotResponse, Error, string>({
        mutationFn: (channelId: string) => addBotToChannel(channelId, accessToken),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['channels'] });
        },
        onError: (error: Error) => {
            throw new Error(`Error adding bot to channel: ${error.message}`);
        },
    });
};