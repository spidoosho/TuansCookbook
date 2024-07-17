import ReactDOM from 'react-dom/client'

import RouterApp from "./components/router"
import MainApp from "./main"


ReactDOM.createRoot(document.getElementById('root')).render(
    <RouterApp>
        <MainApp />
    </RouterApp>
);