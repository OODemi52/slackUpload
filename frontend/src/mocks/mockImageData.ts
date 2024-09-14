export interface MockImage {
    url: string;
    name: string;
    fileID: string;
  }

  export const mockImages: MockImage[] = [
    { url: "https://picsum.photos/200/300?random=1", name: "Image 1", fileID: "1" },
    { url: "https://picsum.photos/200/300?random=2", name: "Image 2", fileID: "2" },
    { url: "https://picsum.photos/200/300?random=3", name: "Image 3", fileID: "3" },
    { url: "https://picsum.photos/200/300?random=4", name: "Image 4", fileID: "4" },
    { url: "https://picsum.photos/200/300?random=5", name: "Image 5", fileID: "5" },
    { url: "https://picsum.photos/200/300?random=6", name: "Image 6", fileID: "6" },
    { url: "https://picsum.photos/200/300?random=7", name: "Image 7", fileID: "7" },
    { url: "https://picsum.photos/200/300?random=8", name: "Image 8", fileID: "8" },
    { url: "https://picsum.photos/200/300?random=9", name: "Image 9", fileID: "9" },
    { url: "https://picsum.photos/200/300?random=10", name: "Image 10", fileID: "10" },
    { url: "https://picsum.photos/200/300?random=11", name: "Image 11", fileID: "11" },
    { url: "https://picsum.photos/200/300?random=12", name: "Image 12", fileID: "12" },
    { url: "https://picsum.photos/200/300?random=13", name: "Image 13", fileID: "13" },
    { url: "https://picsum.photos/200/300?random=14", name: "Image 14", fileID: "14" },
    { url: "https://picsum.photos/200/300?random=15", name: "Image 15", fileID: "15" },
    { url: "https://picsum.photos/200/300?random=16", name: "Image 16", fileID: "16" },
    { url: "https://picsum.photos/200/300?random=17", name: "Image 17", fileID: "17" },
    { url: "https://picsum.photos/200/300?random=18", name: "Image 18", fileID: "18" },
    { url: "https://picsum.photos/200/300?random=19", name: "Image 19", fileID: "19" },
    { url: "https://picsum.photos/200/300?random=20", name: "Image 20", fileID: "20" },
    { url: "https://picsum.photos/200/300?random=21", name: "Image 21", fileID: "21" },
    { url: "https://picsum.photos/200/300?random=22", name: "Image 22", fileID: "22" },
    { url: "https://picsum.photos/200/300?random=23", name: "Image 23", fileID: "23" },
    { url: "https://picsum.photos/200/300?random=24", name: "Image 24", fileID: "24" },
    { url: "https://picsum.photos/200/300?random=25", name: "Image 25", fileID: "25" },
    { url: "https://picsum.photos/200/300?random=26", name: "Image 26", fileID: "26" },
    { url: "https://picsum.photos/200/300?random=27", name: "Image 27", fileID: "27" },
    { url: "https://picsum.photos/200/300?random=28", name: "Image 28", fileID: "28" },
    { url: "https://picsum.photos/200/300?random=29", name: "Image 29", fileID: "29" },
    { url: "https://picsum.photos/200/300?random=30", name: "Image 30", fileID: "30" },
    { url: "https://picsum.photos/200/300?random=31", name: "Image 31", fileID: "31" },
    { url: "https://picsum.photos/200/300?random=32", name: "Image 32", fileID: "32" },
  ];

  export const getMockImages = (page: number, limit: number): MockImage[] => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return mockImages.slice(startIndex, endIndex);
  };