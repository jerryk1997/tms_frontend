import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faUsersGear,
  faRightFromBracket
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import Axios from "axios";

// Custom modules
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";
import { ACTION, AUTH_API } from "../config/constants";

function Header() {
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);
  const navigate = useNavigate();

  async function handleLogout() {
    await Axios.get(AUTH_API.logout);
    appDispatch({ type: ACTION.logout });
    appDispatch({ type: ACTION.flashMessage, value: "Logout successful" });
    navigate("/");
  }

  return (
    <header className="header-bar bg-primary mb-3">
      <div className="container d-flex flex-column flex-md-row align-items-center p-3">
        <h4 className="my-0 mr-md-auto font-weight-normal">
          <Link to="/" className="text-white">
            {" "}
            TMS{" "}
          </Link>
        </h4>

        {/* User function icons */}
        {appState.loggedIn && (
          <div>
            <FontAwesomeIcon icon={faUsersGear} className="header-icon" />
            <Link to="/profile">
              <FontAwesomeIcon icon={faUser} className="header-icon" />
            </Link>
            <FontAwesomeIcon
              onClick={handleLogout}
              icon={faRightFromBracket}
              className="header-icon"
            />
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
