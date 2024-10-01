import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { GraphQLFormattedError } from "graphql";
import useSignUp from "../hooks/useSignUp";
import useSignIn from "../hooks/useSignIn";
import { useAuthStore } from "../stores/authStore";

// Zod schema for form validation
const authSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

type AuthFormValues = z.infer<typeof authSchema>;

const Auth: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false); // Toggle between Signup/Signin mode
  const [error, setError] = useState<string | null>(null); // State for error messages
  const navigate = useNavigate();
  
  const { setToken, setUser } = useAuthStore();

  // Use the corresponding GraphQL mutation based on the mode

  const { signUp } = useSignUp();
  const { signIn } = useSignIn();

  // Setup React Hook Form with Zod validation schema
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
  });

  // Handle form submission
  const onSubmit = async (data: AuthFormValues) => {
    setError(null); // Clear previous errors
    try {
      if (isSignup) {
        const { data: signupData } = await signUp({
          variables: { email: data.email, password: data.password },
        });
        localStorage.setItem("token", signupData.signUp.token);
        setToken(signupData.signUp.token);
        setUser(signupData.signUp.user);
      } else {
        const { data: signinData } = await signIn({
          variables: { email: data.email, password: data.password },
        });
        setToken(signinData.signIn.token);
        setUser(signinData.signIn.user);
        localStorage.setItem("token", signinData.signIn.token);
      }
      navigate("/documents"); // Redirect to the editor page on success
    } catch (err: unknown) {
      // Set error message from Apollo's GraphQL error response
      setError(
        (err as GraphQLFormattedError)?.message ||
          "Something went wrong, please try again."
      );
    }
  };

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content max-w-md w-full flex-col">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">
            {isSignup ? "Sign Up" : "Login"}
          </h1>
        </div>
        <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <div className="card-body">
            {/* Display Error Message */}
            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  className={`input input-bordered ${
                    errors.email ? "input-error" : ""
                  }`}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-error text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <input
                  type="password"
                  className={`input input-bordered ${
                    errors.password ? "input-error" : ""
                  }`}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-error text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="form-control mt-6">
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSignup ? "Sign Up" : "Login"}
                </button>
              </div>
            </form>

            <div className="form-control mt-4 text-center">
              <span>
                {isSignup
                  ? "Already have an account?"
                  : "Don’t have an account?"}{" "}
                <button
                  className="btn btn-link"
                  onClick={() => {
                    setError(null); // Clear any errors when toggling between forms
                    setIsSignup(!isSignup);
                  }}
                >
                  {isSignup ? "Login" : "Sign Up"}
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
