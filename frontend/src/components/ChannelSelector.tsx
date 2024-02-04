import React, { useState, useEffect } from 'react';

interface ChannelSelectorProps {
  onChannelChange: (channelId: string) => void;
}

interface Channel {
    id: string;
    name: string;
  }

const ChannelSelector: React.FC<ChannelSelectorProps> = ({ onChannelChange }) => {
    const [channels, setChannels] = useState<Channel[]>([]);

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async (): Promise<void> => {
    try {
      const response = await fetch(
        'https://ss-server-nu9y.onrender.com/api/getChannels',
      );
      const data = await response.json();
      // Map the array of arrays to an array of strings (channel names)
      const channelOptions = data.map(([id, name]: [string, string]) => ({
        id,
        name,
      }));

      setChannels(channelOptions);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const channelId = event.target.value;
    onChannelChange(channelId);
  };

  return (
    <select onChange={handleChange} defaultValue="" className="custom-select" name="channels" id="channels">
      <option value="" disabled>Choose Channel</option>
      {channels.map(channel => (
        <option key={channel.id} value={channel.id}>{channel.name}</option>
      ))}
    </select>
  );
};

export default ChannelSelector;
