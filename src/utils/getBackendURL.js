export const getBackendURL = () => {
  const apiUrl = process.env.REACT_APP_BACKEND_URL || "apiurl";
  return process.env.NODE_ENV === "production"
    ? apiUrl
    : "http://localhost:8080";
};
