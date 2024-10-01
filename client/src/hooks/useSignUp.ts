import { gql, useMutation } from '@apollo/client';

const SIGNUP_MUTATION = gql`
  mutation SignUp($email: String!, $password: String!) {
    signUp(email: $email, password: $password) {
      token
    }
  }
`;

const useSignUp = () => {
  const [signUp, { data, loading, error }] = useMutation(SIGNUP_MUTATION);

  return {
    signUp,
    data,
    loading,
    error,
  };
};

export default useSignUp;