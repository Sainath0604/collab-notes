export const getLoggedInEmail = (): string | null => {
  return sessionStorage.getItem("loggedInEmail");
};
