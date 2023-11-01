import React, { useState } from "react";

function UserManagementPage() {
  // Sample user data for demonstration
  const initialUsers = [
    {
      id: 1,
      username: "user1",
      email: "user1@example.com",
      password: "",
      groups: ["Group A"],
      status: "active"
    },
    {
      id: 2,
      username: "user2",
      email: "user2@example.com",
      password: "",
      groups: ["Group B", "Group C"],
      status: "disabled"
    }
    // Add more users as needed
  ];

  const [users, setUsers] = useState(initialUsers);

  const handleEdit = userId => {
    // Handle edit action for the user with userId
    // You can implement the editing logic here
  };

  const handleConfirm = userId => {
    // Handle confirm action for the user with userId
    // You can update the user data and make an API call here
  };

  const handleCancel = userId => {
    // Handle cancel action for the user with userId
    // You can reset the user data or cancel the edit operation
  };

  return (
    <div>
      <h1>User Management</h1>

      <table>
        <thead>
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
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>
                <input
                  type="password"
                  value={user.password}
                  onChange={e => {
                    // Update the user's password in state
                    const newPassword = e.target.value;
                    setUsers(prevUsers =>
                      prevUsers.map(u =>
                        u.id === user.id ? { ...u, password: newPassword } : u
                      )
                    );
                  }}
                />
              </td>
              <td>
                <select
                  multiple
                  value={user.groups}
                  onChange={e => {
                    // Update the user's groups in state
                    const newGroups = Array.from(
                      e.target.selectedOptions,
                      option => option.value
                    );
                    setUsers(prevUsers =>
                      prevUsers.map(u =>
                        u.id === user.id ? { ...u, groups: newGroups } : u
                      )
                    );
                  }}
                >
                  <option value="Group A">Group A</option>
                  <option value="Group B">Group B</option>
                  <option value="Group C">Group C</option>
                  {/* Add more group options here */}
                </select>
              </td>
              <td>
                <select
                  value={user.status}
                  onChange={e => {
                    // Update the user's status in state
                    const newStatus = e.target.value;
                    setUsers(prevUsers =>
                      prevUsers.map(u =>
                        u.id === user.id ? { ...u, status: newStatus } : u
                      )
                    );
                  }}
                >
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
              </td>
              <td>
                {user.isEditing ? (
                  <>
                    <button onClick={() => handleConfirm(user.id)}>
                      Confirm
                    </button>
                    <button onClick={() => handleCancel(user.id)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={() => handleEdit(user.id)}>Edit</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserManagementPage;
