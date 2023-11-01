import React, { useState, useEffect } from "react";
import Axios from "axios";

// Custom modules
import Page from "../Page";
import User from "./User";
import { useImmerReducer } from "use-immer";
import { ADMIN_API, ACTION } from "../../config/constants";
import LoadingDotsIcon from "../LoadingDotsIcon";

// Context
import UserManagementStateContext from "./UserManagementStateContext";
import UserManagementDispatchContext from "./UserManagementDispatchContext";

function UserManagement() {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);

  function userMgmtReducer(draft, action) {
    switch (action.type) {
      case ACTION.populateGroups:
        draft.groups = action.value;
        break;
      case ACTION.createGroup:
        draft.groups = draft.groups.concat(action.value);
        break;
    }
  }

  const [state, dispatch] = useImmerReducer(userMgmtReducer, {
    groups: ["a", "b"]
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
      setUsers(
        allUsersResponse.data.users.map(userData => {
          const groups = userData.groups.split("/");
          const user = { ...userData, groups };
          if (user.groups[0] === "") {
            delete user.groups;
          }
          console.log(user);
          return user;
        })
      );

      setIsLoading(false);
    }

    fetchAllUsers();
  }, []);

  return (
    <>
      {isLoading ? (
        <LoadingDotsIcon />
      ) : (
        <Page title="User Management" wide={true}>
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
                  {users.map((user, index) => {
                    return <User user={user} index={index} />;
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
