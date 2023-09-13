import { useState, useEffect } from "react"

export default function Clickable ({ type, handleFolderChange, handleChannelChange, handleFileUpload, state }) {
    const [options, setOptions] = useState([]);
   
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const response = await fetch("http://localhost:3000/api/getChannels");
        const data = await response.json();
        setOptions(data);
    }
   


    if (type === 'path') {
        return (
            <input
                type="file"
                id="dir"
                webkitdirectory="true"
                directory=''
                onChange={handleFolderChange}
            />
        )
    }

    if (type === 'channel') {
        return (
                <select
                    name="channels"
                    id="channels"
                    onChange={handleChannelChange}
                >
                <option value="" disabled selected>Select Channel</option>
                {options.map((option) => (<option key={option[0]} value={option[0]}>{option[1]}</option>))}
                </select>
        )
    }   
    
    if (type === 'upload') {
            return (
                <button onClick={handleFileUpload}>Upload</button>

            )
        }
}

