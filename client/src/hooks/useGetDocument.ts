import { gql, useQuery } from "@apollo/client";
import { toast } from "react-toastify";
import { Document } from "../types/Document";

interface GetDocumentsResponse {
  document: Document;
}

export const GET_DOCUMENT = gql`
  query GetDocument($id: ID!) {
    document(id: $id) {
      id
      name
      content
      createdAt
      updatedAt
      owner {
        id
        email
      }
    }
  }
`;

const useGetDocument = (documentId: string) => {
  const { data, loading, error } = useQuery<GetDocumentsResponse>(
    GET_DOCUMENT,
    {
      onError: (error) => {
        toast.error(error.message);
      },
      variables: {
        id: documentId,
      },
      skip: !documentId,
    }
  );
  return {
    document: data?.document,
    loading,
    error,
  };
};

export default useGetDocument;
