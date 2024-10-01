import { gql, useMutation } from "@apollo/client";

const SIGNIN_MUTATION = gql`
  mutation SignIn($email: String!, $password: String!) {
    signIn(email: $email, password: $password) {
      token
    }
  }
`;

const useSignIn = () => {
  const [signIn, { data, loading, error }] = useMutation(SIGNIN_MUTATION);

  return {
    signIn,
    data,
    loading,
    error,
  };
};

export default useSignIn;
