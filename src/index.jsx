import ReactDOM from 'react-dom/client'

import React from "react";
import { BrowserRouter , Routes, Route } from 'react-router-dom';
import MainApp from "./main";
import FilterApp from "./filter";
import RecipeApp from "./recipes";

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <Routes>
            <Route exact path="/" element={<MainApp />} />
            <Route exact path="/filter" element={<FilterApp />} />
            <Route exact path="/recipes" element={<RecipeApp />} />
        </Routes>
    </BrowserRouter>
);