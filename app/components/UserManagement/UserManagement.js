import React, { useState, useEffect } from "react";
import Axios from "axios";

// Custom modules
import Page from "../Page";
import EditUser from "./EditUser";
import { useImmerReducer } from "use-immer";
import { ADMIN_API, ACTION } from "../../config/constants";
import LoadingDotsIcon from "../LoadingDotsIcon";

// Context
import UserManagementStateContext from "./UserManagementStateContext";
import UserManagementDispatchContext from "./UserManagementDispatchContext";
import CreateUser from "./CreateUser";

function UserManagement() {
  const [isLoading, setIsLoading] = useState(true);

  function userMgmtReducer(draft, action) {
    switch (action.type) {
      case ACTION.populateUsers:
        draft.users = action.value;
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
      const allUsersResponse = await Axios.get(ADMIN_API.getAllUsers);
      const userGroupsResponse = await Axios.get(ADMIN_API.getAllGroups);

      // Get groups
      dispatch({
        type: ACTION.populateGroups,
        value: userGroupsResponse.data.groups
      });

      // Get users
      dispatch({
        type: ACTION.populateUsers,
        value: allUsersResponse.data.users.map(userData => {
          const groups = userData.groups.split("/");
          const user = { ...userData, groups };
          if (user.groups[0] === "") {
            delete user.groups;
          }
          console.log(user);
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
