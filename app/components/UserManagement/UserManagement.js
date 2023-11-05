import React, { useState, useEffect, useContext } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";

// Custom modules
import Page from "../Page";
import EditUser from "./EditUser";
import { useImmerReducer } from "use-immer";
import { ADMIN_API, ACTION } from "../../config/constants";
import LoadingDotsIcon from "../LoadingDotsIcon";

// Context
import DispatchContext from "../../DispatchContext";
import UserManagementStateContext from "./UserManagementStateContext";
import UserManagementDispatchContext from "./UserManagementDispatchContext";
import CreateUser from "./CreateUser";

function UserManagement() {
  const [isLoading, setIsLoading] = useState(true);
  const appDispatch = useContext(DispatchContext);
  const navigate = useNavigate();

  function userMgmtReducer(draft, action) {
    switch (action.type) {
      case ACTION.populateUsers:
        draft.users = action.value;
        break;
      case ACTION.createUser:
        const newUser = action.value;
        newUser.is_active = newUser.isActive === "active" ? 1 : 0;
        delete newUser.isActive;
        delete newUser.password;
        draft.users.push(newUser);
        break;
      case ACTION.editUser:
        const user = draft.users.find(
          user => user.username === action.value.username
        );
        const editedFields = action.value.editedFields;

        user.email = editedFields.email || user.email;

        if (user.groups) {
          if (user.groups.length === 0) {
            delete user.groups;
          } else {
            user.groups = editedFields.groups;
          }
        }

        if (editedFields.isActive) {
          user.is_active = editedFields.isActive === "active" ? 1 : 0;
        }
        break;
      case ACTION.populateGroups:
        draft.groups = action.value;
        break;
      case ACTION.createGroup:
        draft.groups = draft.groups.concat(action.value);
        break;
    }
  }

  const [state, dispatch] = useImmerReducer(userMgmtReducer, {
    users: [],
    groups: []
  });

  useEffect(() => {
    async function fetchAllUsers() {
      console.log("Fetching Users");
      try {
        console.log("Getting users and groups");
        var allUsersResponse = await Axios.get(ADMIN_API.getAllUsers);
        var userGroupsResponse = await Axios.get(ADMIN_API.getAllGroups);
        console.log("Responses", allUsersResponse, userGroupsResponse);
      } catch (error) {
        console.log(error);
        navigate("/");
        appDispatch({ type: ACTION.flashMessage, value: "There was an error" });
        return;
      }
      // Get groups
      dispatch({
        type: ACTION.populateGroups,
        value: userGroupsResponse.data.groups
      });

      // Get users
      dispatch({
        type: ACTION.populateUsers,
        value: allUsersResponse.data.users.map(userData => {
          const user = { ...userData };
          if (userData.groups) {
            user.groups = userData.groups.split("/");
          }
          return user;
        })
      });

      setIsLoading(false);
    }

    fetchAllUsers();
  }, []);

  return (
    <>
      {isLoading ? (
        <LoadingDotsIcon />
      ) : (
        <Page title="User Management" width={"wide"}>
          <UserManagementStateContext.Provider value={state}>
            <UserManagementDispatchContext.Provider value={dispatch}>
              <h1>User Management</h1>

              <table className="table">
                <thead className="thead-light">
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Password</th>
                    <th>Groups</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <CreateUser />
                  {state.users.map((user, index) => {
                    return (
                      <EditUser user={user} index={index + 1} key={index + 1} />
                    );
                  })}
                </tbody>
              </table>
            </UserManagementDispatchContext.Provider>
          </UserManagementStateContext.Provider>
        </Page>
      )}
    </>
  );
}

export default UserManagement;
