import React from "react";
import LoginForm from "../components/LoginForm";

const LoginPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
          Login to Collaborative Notes
        </h2>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
