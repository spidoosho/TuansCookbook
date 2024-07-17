import React from 'react'
import ReactDOM from 'react-dom/client'

import RouterApp from "./components/router"
import MainApp from "./main"


ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterApp>
            <MainApp />
        </RouterApp>
    </React.StrictMode>
);