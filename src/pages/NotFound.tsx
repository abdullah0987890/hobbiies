import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext"; // adjust path as needed
import { Button } from "@/components/ui/button"; // assuming you're using shadcn/ui

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isCustomerTryingToAccessDashboard =
    user?.role === "customer" && location.pathname === "/dashboard";

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleProviderSignup = () => {
    navigate("/signup");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4">404</h1>

        {isCustomerTryingToAccessDashboard ? (
          <>
            <p className="text-xl text-gray-600 mb-4">
              You are currently signed in as a <strong>Customer</strong>.
            </p>
            <p className="text-gray-700 mb-4">
              To sell your services, please sign up as a <strong>Provider</strong>.
            </p>
            <Button onClick={handleProviderSignup}>
              Sign Up as Provider
            </Button>
          </>
        ) : (
          <>
            <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
            <a href="/" className="text-blue-500 hover:text-blue-700 underline">
              Return to Home
            </a>
          </>
        )}
      </div>
    </div>
  );
};

export default NotFound;
