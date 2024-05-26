import React from "react";
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';

import Login from "./pages/auth/Login";
import Home from "./pages/Home";
import Header from "./components/navbar/Header";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route index element={<Login />} />
      <Route path="login" element={<Login />} />
      <Route path="home" element={<Home />} />
    </>
  )
)

function App({routes}) {

  return (
    <>
      <RouterProvider router={router}/>
    </>
  );
}

export default App;
