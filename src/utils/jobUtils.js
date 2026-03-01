export const getJobs = () =>
  JSON.parse(localStorage.getItem("jobs")) || [];
