import { ChangeEvent, useState } from 'react'
import './App.css'
import Link from './components/Link'
import Logo from './components/Logo'
import Clickable from './components/Clickable'


declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    directory?: string;
    webkitdirectory?: string;
    e?: string
  }
}

interface AppState {
  dir: string;
  channel: string;
}

function App() {
  const [state, setState] = useState<AppState>({
    dir:'',
    channel:''
  })
  
  const handleFolderChange = (e: ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault()
  
    const folderPath = e.target.files?.[0]?.webkitRelativePath;
    const folderDir = folderPath?.split('/');
    setState(prevState => ({ ...prevState, dir: folderDir?[0].toString(): '' }));
  }
  const handleChannelChange = (e: ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault()
    const channel = e.target.value;
    setState(prevState => ({ ...prevState, channel: channel}));
    };
  
    const handleFileUpload = async (): Promise<void> => {
       try {
            if (state.dir && state.channel) {
              const response = await fetch("http://localhost:3000/api/uploadFiles", {
                method: "POST",
                headers: {
                  "content-type": "application/json",
                },
                body: JSON.stringify({
                  channel: state.channel,
                  dir: state.dir,
                }),
              });
      
              if (response.ok) {
                console.log("Upload successful!");
                console.log(await response.text());
              } else {
                console.log("Upload failed!");
              }
            } else {
              console.log("Please select both a folder and a channel.");
            }
          } catch (error) {
            console.log("Error uploading file:", error);
          }
        };



  return (
    <>
      <div>
        <Link org={"ccmd"} componentToBePassed={<Logo org={"ccmd"}/>}/>
        <Link org={"slack"} componentToBePassed={<Logo org={"slack"}/>}/>
      </div>
      <h1>Christ Chapel Slack <br /> File Uploader</h1>
      <div className="card">
        <p>
          Took 100+ pictures today and don't feel like uploading them to Slack 10 pictures at a time? This app will automatically upload them for you! Just choose the folder you're uploading from and the channel your uploading to and the bot will take care of the rest!
        </p>
      </div>
      <p className="read-the-docs">
        Folder:
      </p>
      <Clickable type='path' handleFolderChange={handleFolderChange} state={state} />
      <p className="read-the-docs">
        Channel:
      </p>
      <Clickable type='channel' handleChannelChange={handleChannelChange} state={state} />
      <br />
      <br />
      <Clickable type='upload' handleFileUpload={handleFileUpload} state={state} />

    </>
  )
}


export default App
