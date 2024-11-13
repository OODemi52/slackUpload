import { useInfiniteQuery } from "@tanstack/react-query";
import { useContext, useMemo } from "react";
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

const fetchImageUrls = async (accessToken: string | null, page: number, limit: number | null = 18): Promise<FetchImagesResponse> => {
    const response = await fetch(`${import.meta.env.VITE_SERVERPROTOCOL}://${import.meta.env.VITE_SERVERHOST}/api/getImagesUrls?page=${page}&limit=${limit}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const imageUrls = await response.json();
    return imageUrls;
};

export const useImageUrls = (limit: number | null = 16) => {
    const { accessToken } = useContext(AuthContext);

    const memoizedFetchImageUrls = useMemo(() => {
        return (page: number) => fetchImageUrls(accessToken, page, limit);
    }, [accessToken, limit]);

    return useInfiniteQuery<FetchImagesResponse, Error>({
        queryKey: ['imageUrls'],
        queryFn: ({ pageParam = 1 }) => memoizedFetchImageUrls(pageParam as number),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.nextPage,
        enabled: !!accessToken,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 30,
        select: (data) => ({
            pages: data.pages.map(page => ({
                ...page,
                imageUrls: page.imageUrls.filter((url, index, self) =>
                    index === self.findIndex((t) => t.fileID === url.fileID)
                )
            })),
            pageParams: data.pageParams,
        })
    });
};