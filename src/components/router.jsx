import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import MainApp from "../main"
import RecipeApp from '../recipe';

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainApp />,
    },
    {
        path: "/recipe",
        children: [
            {
                path: ":name",
                element: <RecipeApp />
            }
        ]
    }
]);

function RouterApp() {
    return <RouterProvider router={router} />;
}

export default RouterApp;