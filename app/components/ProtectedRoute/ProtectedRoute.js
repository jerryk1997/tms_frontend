import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";

// Custome modules
import { ACTION, AUTH_API, USER_API } from "../../config/constants";
import LoadingDotsIcon from "../LoadingDotsIcon";
import NotFound from "../NotFound";
import UserStateContext from "./UserStateContext";
import DispatchContext from "../../DispatchContext";

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
  const appDispatch = useContext(DispatchContext);
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
        console.log("Checking");
        await Axios.get(AUTH_API.verifySession);

        const response = await Axios.get(USER_API.currentUser);
        const user = response.data.user[0] || null;
        console.log(user);

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
        console.log(isAuthorised);
        if (
          props.authorisedGroup === "" ||
          userGroups.includes(props.authorisedGroup)
        ) {
          setIsAuthorised(true);
          console.log(isAuthorised);
        } else {
          console.log(
            `${props.authorisedGroup === ""} || ${userGroups.includes(
              props.authorisedGroup
            )}`
          );
          setIsAuthorised(false);
          console.log(isAuthorised);
        }
      } catch (error) {
        appDispatch({ type: ACTION.logout });
        setIsAuthorised(false);
        console.error("Page not found");
      }
    }

    checkAuthorised();
  }, []);

  useEffect(() => {
    console.log(isAuthorised);
  }, [isAuthorised]);

  return (
    <>
      {isAuthorised === undefined && <LoadingDotsIcon />}
      {isAuthorised && (
        <UserStateContext.Provider value={{ userState, setUserState }}>
          {props.children}
        </UserStateContext.Provider>
      )}
      {/* !isAuthorised wouldnt work since isAuthorised can be undefined*/}
      {isAuthorised === false && <NotFound />}
    </>
  );
}

export default ProtectedRoute;
