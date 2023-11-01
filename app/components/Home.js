import React, { useContext } from "react";

// Custom modules
import Page from "./Page";
import StateContext from "../StateContext";
import ProtectedRoute from "./ProtectedRoute/ProtectedRoute";

function Home() {
  const appState = useContext(StateContext);

  return (
    <ProtectedRoute authorisedGroup="">
      <Page title="Welcome!" wide={true}>
        <div className="row align-items-center">
          <div className="col-lg-15 py-3 py-md-5">
            <h1 className="display-3">
              Hi {appState.username}, welcome to TMS!
            </h1>
            <p className="lead text-muted">
              Hope you enjoy managing your tasks effectively
            </p>
          </div>
        </div>
      </Page>
    </ProtectedRoute>
  );
}

export default Home;
