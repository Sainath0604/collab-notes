import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  _id: string;
  name: string;
  email: string;
  iat: number;
  exp: number;
}

export const getLoggedInEmail = (): string | null => {
  return sessionStorage.getItem("loggedInEmail");
};
export const getAccessToken = (): string | null => {
  return sessionStorage.getItem("token");
};

export const getDecodedUser = (): DecodedToken | null => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded: DecodedToken = jwtDecode(token);
    return decoded;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

export const getLocalUser = () => {
  const user = sessionStorage.getItem("loggedInUser");
  return user ? JSON.parse(user) : null;
};
