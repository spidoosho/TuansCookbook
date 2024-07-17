import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import MainApp from "../main"
import FilterApp from "../filter"
import RecipeApp from "../recipes"

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainApp />,
    },
    {
        path: "/filter",
        element: <FilterApp />,
    },
    {
        path: "/recipes",
        element: <RecipeApp />,
    }
]);

function RouterApp() { 
    return <RouterProvider router={router} />;
}

export default RouterApp;