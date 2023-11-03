import React, { useState, useEffect, useContext } from "react";
import Axios, { AxiosError } from "axios";
import { useImmerReducer } from "use-immer";

// Custome modules
import { ACTION, AUTH_API, HTTP_CODES } from "../../config/constants";
import LoadingDotsIcon from "../LoadingDotsIcon";
import NotFound from "../NotFound";
import DispatchCheckContext from "./DispatchCheckContext";
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
  const [renderContent, setRenderContent] = useState(<LoadingDotsIcon />);

  function toggleReducer(draft, action) {
    switch (action.type) {
      case ACTION.toggle:
        draft.state = !draft.state;
        break;
    }
  }
  const [checkToggle, toggleDispatch] = useImmerReducer(toggleReducer, {
    state: true
  });

  // Check authorised.
  useEffect(() => {
    async function checkAuthorised() {
      try {
        // ============= Check user logged in =============
        console.log(`Checking <${props.authorisedGroup}>`, props.children);
        console.log(`<${props.authorisedGroup}> Checking session`);
        await Axios.get(AUTH_API.verifySession);
        console.log(`<${props.authorisedGroup}> session verified`);

        // ============= Check group if needed =============
        if (props.authorisedGroup !== "") {
          console.log(`<${props.authorisedGroup}> Checking group`);
          const sanitisedAuthorisedGroup = encodeURIComponent(
            props.authorisedGroup
          );
          console.log(AUTH_API.verifyGroup(sanitisedAuthorisedGroup));
          try {
            await Axios.get(AUTH_API.verifyGroup(sanitisedAuthorisedGroup));
            console.log(`<${props.authorisedGroup}> Authorised`);

            // Authorised, setting page content
            setRenderContent(
              <DispatchCheckContext.Provider value={toggleDispatch}>
                {props.children}
              </DispatchCheckContext.Provider>
            );
          } catch (error) {
            if (
              error instanceof AxiosError &&
              error.response.status === HTTP_CODES.unauthorised
            ) {
              // Unauthorised, setting page not found
              setRenderContent(<NotFound />);
              console.log(`<${props.authorisedGroup}> Unauthorised`);
            }
          }
        } else {
          console.log(`<${props.authorisedGroup}> Authorised`);
          setRenderContent(props.children);
        }
      } catch (error) {
        appDispatch({ type: ACTION.logout });
        setRenderContent(<NotFound />);
        console.error("Page not found");
      }
    }
    console.log("Before checking");
    setRenderContent(<LoadingDotsIcon />);
    checkAuthorised();
  }, [props.authorisedGroup, checkToggle, props.children]);

  return <>{renderContent}</>;
}

export default ProtectedRoute;
