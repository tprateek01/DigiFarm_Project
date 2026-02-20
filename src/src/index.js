import React from 'react';
import App from './App';
import ReactDom from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

const RealRoot=document.getElementById("root");
const VRoot=ReactDom.createRoot(RealRoot);
VRoot.render(<BrowserRouter>
<App />

</BrowserRouter>);

