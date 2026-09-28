import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  ScrollRestoration,
} from "react-router-dom";

import MyNavbar from "./navbar";
import MainApp from "../main";
import RecipeApp from "../recipe";
import AddRecipeApp from "../add";
import NotFound from "../notFound";

function Layout() {
  return (
    <>
      <MyNavbar />
      <main className="page">
        <Outlet />
      </main>
      <footer className="footer">
        Cooked up with love by Tuan · {new Date().getFullYear()}
      </footer>
      <ScrollRestoration />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <MainApp /> },
      { path: "/recipe/:name", element: <RecipeApp /> },
      { path: "/add", element: <AddRecipeApp /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

function RouterApp() {
  return <RouterProvider router={router} />;
}

export default RouterApp;
