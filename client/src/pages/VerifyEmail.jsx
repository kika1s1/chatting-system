import {  useSearchParams } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect } from "react";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
    const { verifyEmail } = useAuthStore();

    useEffect(() => {
        const handleVerifyEmail = async () => {
            await verifyEmail(`token=${token}&email=${email}`);
            // add delay
            setTimeout(() => {
                window.location.href = "/login";
            }, 3000); // Redirect after 3 seconds
        };
        handleVerifyEmail();

        // Cleanup function to avoid memory leaks
        return () => {
            // Any necessary cleanup can be done here
        };
    }, [verifyEmail, token, email]);

    return (
        <div className="min-h-screen flex flex-col justify-center items-center">
            <p className="text-gray-500 text-center">Please wait a moment.</p>
            <div className="loader my-4">
                <svg
                    className="animate-spin h-5 w-5 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 1 1 16 0A8 8 0 0 1 4 12zm2.5 0a5.5 5.5 0 1 0 11 0A5.5 5.5 0 0 0 6.5 12z"
                    ></path>
                </svg>
            </div>
            <p className="text-gray-500 text-center">Thank you for your patience!</p>
            <p className="text-gray-500 text-center">Redirecting you to the login page...</p>
            <p className="text-gray-500 text-center">
                If you are not redirected, please click the button below.
            </p>
            <a href="/login" className="btn btn-primary mt-4">
                Go to Login
            </a>
        </div>
    );
};

export default VerifyEmail;