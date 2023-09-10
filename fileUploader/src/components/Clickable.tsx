import React from "react"

export default function Clickable ({ type }) {
    
    const handleFolderChange = (e) => {
        const folderPath = e.target.files[0].webkitRelativePath
        console.log('Selected folder:', e.target.files)
        console.log(folderPath) 
        // Explaination of wcd filehy I caan't access absolute path: https://www.quora.com/How-can-I-code-in-JavaScript-to-download-my-files-to-a-specific-folder-where-I-want-to-save
    }
        
        
    const handleChannelChange = (e) => {
        console.log("Will also add later!")
        //Fetch channels from Node app (need to create a channel+name generator function)
        //Display channels with their channel names, store ids in value property
        //Save state of select chosen, state will be used to select the channel one upload is pressed
    }

    const handleFileUpload = (e) => {
        console.log("Will add later!")
        //Need to pass channel and path to Node app, two uses of set state, consider custom hook
    }

    
    if (type === 'path') {
        return (
            <input
                type="file"
                id="dir"
                webkitdirectory=''
                directory=''
                onChange={handleFolderChange}
            />
        )
    }

    if (type === 'channel') {
        return (
                <select name="channels" id="channels">
                    <option value={'for_now'/*channel_id*/}>{/*channel*/}</option>
                </select>
        )
    }   
    
    if (type === 'upload') {
            return (
                <button onClick={handleFileUpload}>Upload</button>
            )
        }
}

