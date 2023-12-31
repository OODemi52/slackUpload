import { ChangeEvent, useState } from 'react'
import './App.css'
import Link from './components/Link'
import Logo from './components/Logo'
import Clickable from './components/Clickable'
import Spacer from './components/Spacer'


declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    directory?: string;
    webkitdirectory?: string;
    e?: string
  }
}

interface AppState {
  dirName: string;
  channel: string;
}

function App() {
  const [state, setState] = useState<AppState>({
    dirName:'',
    channel:''
  })
  
  const handleFolderChange = (e: ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault()
  
    const folderPath = e.target.files?.[0]?.webkitRelativePath;
    const folderDir = folderPath?.split('/');   
    console.log(folderPath);
    console.log(folderDir[0]);
    setState(prevState => ({ ...prevState, dirName: folderDir?.[0]?.toString() ?? '' }));
  }

  const handleChannelChange = (e: ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault()
    const channel = e.target.value;
    setState(prevState => ({ ...prevState, channel: channel}));
    };
  
    const handleFileUpload = async (): Promise<void> => {
       try {
            if (state.dirName && state.channel) {
              const response = await fetch("http://localhost:3000/api/uploadFiles", {
                method: "POST",
                headers: {
                  "content-type": "application/json",
                },
                body: JSON.stringify({
                  channel: state.channel,
                  dirName: state.dirName,
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
      <h1>Christ Chapel <br /> Slack Image Uploader</h1>
      <div className="card">
        <p>
          Took 100+ pictures today and don't feel like uploading them to Slack 10 pictures at a time? This app will automatically upload them for you! Just choose the folder you're uploading from and the channel your uploading to and the bot will take care of the rest!
        </p>
      </div>
      
      <span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className='' style={{}}>
            <p className="read-the-docs">Folder:</p>
            <Clickable type='path' handleFolderChange={handleFolderChange} state={state} />
          </div>
          <Spacer size={2} />
          <div style={{}}>
            <p className="read-the-docs">Channel:</p>
            <Clickable type='channel' handleChannelChange={handleChannelChange} state={state} />
          </div>
        </div>
      </span>
      <Spacer size={1.5} />
      <Clickable type='upload' handleFileUpload={handleFileUpload} state={state} />

    </>
  )
}


export default App
