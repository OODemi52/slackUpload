import { useState, useEffect } from 'react'
import './App.css'
import { SignInWithSlack } from './components/SignInWithSlack'
import Modal from './components/Modal'
import Dashboard from './components/Dashboard'
import Logo from './components/Logo'
import logo from '../public/SSLOGO_NOBG.png'

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    directory?: string;
    webkitdirectory?: string;
    e?: string
  }
}

interface AppState {
  dirName: string;
  files: FileList | null;
  channel: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [user, setUser] = useState(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [state, setState] = useState<AppState>({
    dirName: '',
    files: null,
    channel: '',
  });

  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false);
    }
  }, [isFirstLoad]);

  const handleFolderChange = (dirName: string, files: FileList | null): void => {
    setState(prevState => ({
      ...prevState,
      dirName,
      files,
    }));
  };

  const handleChannelChange = (channelId: string) => {
    setState(prevState => ({
      ...prevState,
      channel: channelId,
    }));
  };
  
  const handleFileUpload = async (): Promise<void> => {
    if (state.files && state.files.length > 0 && state.channel) {
      const formData = new FormData();
      formData.append('channel', state.channel);
      
      const filteredFiles = Array.from(state.files).filter(file =>
        file.name.toLowerCase().endsWith('.jpg')
      );
  
      for (const file of filteredFiles) {
        formData.append('files', file, file.name);
      }
  
      try {
        const response = await fetch("https://tame-cyan-adder-shoe.cyclic.app/api/uploadFiles", {
          method: "POST",
          body: formData,
        });
  
        if (response.ok) {
          console.log("Upload successful!");
        } else {
          console.error("Upload failed!", await response.text());
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    } else {
      console.log("Please select a folder and choose a channel.");
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Modal>
          <img src={logo} alt="Slack Shots Logo" className="logo-image" />
          <h1>SlackShots</h1>
          <h3>Click Below To Add The App/Sign Into Your Workspace!</h3>
          <SignInWithSlack />
        </Modal>
      </>
    )
  }

  return (
    <>
      <Dashboard />
      {/*<div>
        <img src="../SSLOGO_NOBG.png" alt="Logo" />
      </div>
      <h1>SlackShots</h1>
      <div className="card">
      </div>
      
      <span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className='' style={{}}>
            <p className="read-the-docs">Folder:</p>
            <FolderSelector onFolderChange={handleFolderChange} />
          </div>
          <Spacer size={2} />
          <div style={{}}>
            <p className="read-the-docs">Channel:</p>
            <ChannelSelector onChannelChange={handleChannelChange} /> 
          </div>
        </div>
      </span>
      <Spacer size={1.5} />
      <UploadButton 
        disabled={!state.dirName || !state.channel}  
        onUpload={handleFileUpload} 
  />*/}
    </>
  )
}


export default App
