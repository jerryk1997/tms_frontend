import React, { useEffect, useState } from "react";
import * as ReactDOM from "react-dom/client";
import { useImmerReducer } from "use-immer";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Axios from "axios";

// Custom components
import Header from "./components/Header";
import Login from "./components/Login";
import Home from "./components/Home";
import Profile from "./components/Profile";
import StateContext from "./StateContext";
import DispatchContext from "./DispatchContext";
import FlashMessages from "./components/FlashMessages";
import NotFound from "./components/NotFound";
import LoadingDotsIcon from "./components/LoadingDotsIcon";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import UserManagement from "./components/UserManagement/UserManagement";

Axios.defaults.baseURL = "http://localhost:8080/api/v1";
Axios.defaults.withCredentials = true;

function Main() {
  const [isLoading, setIsLoading] = useState(true);
  const initialState = {
    loggedIn: false,
    username: null,
    renderToggle: true,
    flashMessages: []
  };
  console.log("Main");

  function appReducer(draft, action) {
    switch (action.type) {
      case "login":
        draft.loggedIn = true;
        draft.username = action.value;
        break;
      case "logout":
        draft.loggedIn = false;
        draft.username = null;
        break;
      case "flash message":
        draft.flashMessages.push(action.value);
        break;
      case "toggle":
        draft.renderToggle = !draft.renderToggle;
        break;
    }
  }

  const [state, dispatch] = useImmerReducer(appReducer, initialState);

  // Check user session, so state reset does not affect session
  useEffect(() => {
    async function checkLogin() {
      try {
        const response = await Axios.get("/user/profile");
        if (response.status === 200) {
          dispatch({
            type: "login",
            value: response.data.user[0].username
          });
        }
      } catch (error) {
        if (error.response.status === 401) {
        } else {
          throw new Error(error);
        }
      }
      setIsLoading(false);
    }

    checkLogin();
  }, []);

  return (
    <>
      {isLoading && <LoadingDotsIcon />}
      {!isLoading && (
        <StateContext.Provider value={state}>
          <DispatchContext.Provider value={dispatch}>
            <BrowserRouter>
              <FlashMessages messages={state.flashMessages} />
              <Header />
              <Routes>
                <Route
                  path="/"
                  element={
                    <Navigate to={state.loggedIn ? "/home" : "/login"} />
                  }
                />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/home"
                  element={
                    <ProtectedRoute authorisedGroup="">
                      <Home />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute authorisedGroup="">
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user-management"
                  element={
                    <ProtectedRoute authorisedGroup="admin">
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </DispatchContext.Provider>
        </StateContext.Provider>
      )}
    </>
  );
}

const root = ReactDOM.createRoot(document.querySelector("#app"));
root.render(<Main />);

if (module.hot) {
  module.hot.accept();
}
