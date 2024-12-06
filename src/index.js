import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./routes/error-page";
import Login from "./routes/login";
import Register from "./routes/register";
import Layout from "./routes/layout";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />, // Use the layout for the home route
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <App />, // This will be rendered inside the MainLayout's Outlet
      },
      {
        path: "/calls",
        element: <App />, // Private route inside the layout
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RouterProvider router={router} />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
