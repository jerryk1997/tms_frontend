import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";

// Custome modules
import { AUTH_API, USER_API } from "../../config/constants";
import LoadingDotsIcon from "../LoadingDotsIcon";
import NotFound from "../NotFound";
import UserStateContext from "./UserStateContext";

/**
 * A wrapper component that checks user authorization and renders
 * content based on authorization status.
 *
 * @component
 * @param {string} props.authorisedGroup - The group that the user needs to belong to for authorization.
 * Specify 1 group to allow or "" to allow all groups(ie user is logged in).
 *
 */
function ProtectedRoute(props) {
  const [isAuthorised, setIsAuthorised] = useState();
  const [userState, setUserState] = useState({
    usernamme: "",
    email: ""
  });

  const navigate = useNavigate();

  // Check authorised.
  useEffect(() => {
    async function checkAuthorised() {
      try {
        //Fetch user
        const response = await Axios.get(USER_API.currentUser);
        const user = response.data.user[0] || null;

        if (!user) {
          throw new Error("User not found");
        }

        // Set username and email for context
        setUserState({
          username: user.username,
          email: user.email
        });

        //Check groups
        const userGroupsStr = user.groups;
        const userGroups = userGroupsStr.split("/");
        if (
          props.authorisedGroup === "" ||
          userGroups.includes(props.authorisedGroup)
        ) {
          setIsAuthorised(true);
        } else {
          setIsAuthorised(false);
        }
      } catch (error) {
        setIsAuthorised(false);
        console.error("Page not found");
      }
    }

    checkAuthorised();
  }, []);

  return (
    <>
      {isAuthorised === null && <LoadingDotsIcon />}
      {isAuthorised && (
        <UserStateContext.Provider value={{ userState, setUserState }}>
          {props.children}
        </UserStateContext.Provider>
      )}
      {!isAuthorised && <NotFound />}
    </>
  );
}

export default ProtectedRoute;
