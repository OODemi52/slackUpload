import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface FilesDeletionResponse {
    message: string;
  }

interface FileDeletionMetaData {
    id: string;
    deleteFlag: "a" | "b";
}

const deleteImages = async (filesToDelete: FileDeletionMetaData[], accessToken: string | null) => {
    const response = await fetch(`${import.meta.env.VITE_SERVERPROTOCOL}://${import.meta.env.VITE_SERVERHOST}/api/deleteFiles`,
        {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ files: filesToDelete }),
        }
    );

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
};

export const useDeleteImages = () => {
    const queryClient = useQueryClient();
    const { accessToken } = useContext(AuthContext);

    return useMutation<FilesDeletionResponse, Error, FileDeletionMetaData[]>({
        mutationFn: (filesToDelete: FileDeletionMetaData[]) => deleteImages(filesToDelete, accessToken),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['imageUrls'] });
        },
        onError: (error: Error) => {
            throw new Error(`Error deleting images: ${error.message}`);
        },
    });
};