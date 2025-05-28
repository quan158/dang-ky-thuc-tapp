import './App.css'
import { BrowserRouter } from "react-router-dom";
import AppRoute from './routes/AppRoute'
import './assets/css/global.css'

function App() {
  return (
    <BrowserRouter>
      <AppRoute />
    </BrowserRouter>  )
}

export default App
