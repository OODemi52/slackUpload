import React from 'react'
import './App.css'
import Link from './components/Link'
import Logo from './components/Logo'
import Clickable from './components/Clickable'

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    directory?: string;
    webkitdirectory?: string;
    event?: string
  }
}

function App() {

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
      <Clickable type={'path'} />
      <p className="read-the-docs">
        Channel:
      </p>
      <Clickable type={'channel'} />
      <br />
      <br />
      <Clickable type={'upload'} />

    </>
  )
}


export default App
