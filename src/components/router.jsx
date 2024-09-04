import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import MainApp from "../main"
import RecipeApp from '../recipe'
import AddRecipeApp from '../add'

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainApp />,
    },
    {
        path: "/recipe/:name",
        element: <RecipeApp />
    },
    {
        path: "/add",
        element: <AddRecipeApp />
    }
]);

function RouterApp() { 
    return <RouterProvider router={router} />;
}

export default RouterApp;