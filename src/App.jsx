import React, { Suspense } from "react";
import { useRoutes } from "react-router-dom";
import routes from "./routes/app.routes";
import "antd/dist/reset.css";

export default function App() {
  const element = useRoutes(routes);
  return <Suspense fallback={<div>Loading...</div>}>{element}</Suspense>;
}
