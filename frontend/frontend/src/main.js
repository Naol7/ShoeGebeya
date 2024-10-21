import React from 'react';
import ReactDom from 'react-dom/client';
import './style.css'
import App from './App';
import {BrowserRouter, Routes, Route} from 'react-router-dom'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <BrowserRouter>
           <Routes>
            <Route path="/*" element = {<App/>}/>
            </Routes> 
        </BrowserRouter>
    </React.StrictMode>
)