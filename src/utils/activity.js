export const addActivity = (username, message) => {
  const users = JSON.parse(localStorage.getItem("users")) || [];

  const updatedUsers = users.map(user => {
    if (user.username === username) {
      return {
        ...user,
        activity: [
          ...(user.activity || []),
          {
            message,
            time: new Date().toLocaleString()
          }
        ]
      };
    }
    return user;
  });

  localStorage.setItem("users", JSON.stringify(updatedUsers));

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser.username === username) {
    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        ...currentUser,
        activity: updatedUsers.find(u => u.username === username).activity
      })
    );
  }
};
