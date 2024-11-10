import { useInfiniteQuery } from "@tanstack/react-query";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";

interface ImageUrl {
    url: string;
    name: string;
    fileID: string;
}
  
interface FetchImagesResponse {
    imageUrls: ImageUrl[];
    nextPage: number | null;
}

const fetchImageUrls = async (accessToken: string | null, page: number, limit: number = 16): Promise<FetchImagesResponse> => {
    const response = await fetch(`${import.meta.env.VITE_SERVERPROTOCOL}://${import.meta.env.VITE_SERVERHOST}/api/getImagesUrls?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const imageUrls = await response.json();

    console.log(imageUrls);

    return imageUrls;
};

export const useImageUrls = (limit: number = 16) => {
    const { accessToken } = useContext(AuthContext);

    return useInfiniteQuery<FetchImagesResponse, Error>({
        queryKey: ['imageUrls'],
        queryFn: ({ pageParam = 1 }) => fetchImageUrls( accessToken, pageParam as number, limit),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.nextPage,
        enabled: !!accessToken,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 30,
    });
};