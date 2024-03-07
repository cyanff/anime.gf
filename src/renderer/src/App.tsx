import './assets/global.css'
import Versions from './components/Versions'

function App(): JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <div>
      <div className="bg-red-500 w-56 h-56">Hi</div>
      <Versions />
    </div>
  )
}

export default App
