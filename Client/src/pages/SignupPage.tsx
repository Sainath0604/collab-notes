import React from "react";
import SignupForm from "../components/SignupForm";

const SignupPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
          Create a New Account
        </h2>
        <SignupForm />
      </div>
    </div>
  );
};

export default SignupPage;
