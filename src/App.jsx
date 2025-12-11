import React, { Suspense } from "react";
import { useRoutes } from "react-router-dom";
import routes from "./routes/app.routes";
import LoadingState from "./components/common/LoadingState";
import RealtimeInvitationListener from "./components/realtime/RealtimeInvitationListener";

export default function App() {
  const element = useRoutes(routes);
  
  return (
    <Suspense
      fallback={
        <LoadingState
          fullscreen
          message="Launching Teammy..."
          subtext="Getting things ready for you."
        />
      }
    >
      <RealtimeInvitationListener />
      {element}
    </Suspense>
  );
}
