import { useState, useEffect } from "react"

interface ClickableProps {
    type: "path" | "channel" | "upload";
    handleFolderChange: () => void;
    handleChannelChange: () => void;
    handleFileUpload?: () => void;
    state: {
      dirName: string;
      channel: string;
    };
  }
  
export default function Clickable ({ type, handleFolderChange, handleChannelChange, handleFileUpload, state }: ClickableProps) {
    
    const [options, setOptions] = useState<string[]>([]);
   
    useEffect((): void => {
        fetchData();
    }, []);

    const fetchData = async (): Promise<void> => {
        const response = await fetch("http://localhost:3000/api/getChannels");
        const data = await response.json();
        setOptions(data);
    }
   
    console.log(state)


    if (type === 'path') {
        return (
            <>
            <label htmlFor="dir" className="custom-file-upload">{state.dirName === ""? "Choose Folder": state.dirName}</label>
            <input
                type="file"
                id="dir"
                webkitdirectory="true"
                directory=''
                onChange={handleFolderChange} 
            />
            </>
        )
    }

    if (type === 'channel') {
        return (
                <select
                    name="channels"
                    id="channels"
                    onChange={handleChannelChange}
                    defaultValue="default"
                    className="custom-select"
                >
                <option value="default" disabled>Choose Channel</option>
                {options.map((option) => (<option key={option[0]} value={option[0]}>{option[1]}</option>))}
                </select>
        )
    }   
    
    if (type === 'upload') {
            return (
                <button onClick={handleFileUpload} disabled={!state.dirName || !state.channel}>Upload</button>
            )
        }
}

