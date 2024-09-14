  export interface MockChannel {
    value: string,
    label: string,
    isMember: boolean,
  }

  export const mockImages: MockChannel[] = [
    {
      value: "C0000001",
      label: "Channel 1",
      isMember: true,
    },
    {
      value: "C0000002",
      label: "Channel 2",
      isMember: false,
    },
    {
      value: "C0000003",
      label: "Channel 3",
      isMember: true,
    },
    {
      value: "C0000004",
      label: "Channel 4",
      isMember: true,
    },
    {
      value: "C0000005",
      label: "Channel 5",
      isMember: false,
    },
    {
      value: "C0000006",
      label: "Channel 6",
      isMember: false,
    },
  ];

  export const getMockChannels = (): MockChannel[] => {
    return mockImages.map(channel => ({
      value: channel.value,
      label: channel.label,
      isMember: channel.isMember,
    }));
  };