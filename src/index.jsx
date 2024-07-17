import React from 'react'
import ReactDOM from 'react-dom/client'
import MyNavbar from "./components/navbar"
import MainApp from "./main"
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <MyNavbar />
            <MainApp />
        </BrowserRouter>
    </React.StrictMode>
);