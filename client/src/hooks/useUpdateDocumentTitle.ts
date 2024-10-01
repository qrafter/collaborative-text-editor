import { useCallback } from "react";
import { useMutation, gql } from "@apollo/client";

const UPDATE_DOCUMENT_TITLE = gql`
  mutation UpdateDocumentTitle($id: ID!, $name: String!) {
    updateDocumentTitle(id: $id, name: $name) {
      id
      name
    }
  }
`;

const useUpdateDocumentTitle = () => {
  const [updateDocumentTitleMutation, { loading, error }] = useMutation(UPDATE_DOCUMENT_TITLE);

  const updateDocumentTitle = useCallback((documentId: string, newTitle: string) => {
    return updateDocumentTitleMutation({
      variables: { id: documentId, name: newTitle },
    });
  }, [updateDocumentTitleMutation]);

  return {
    updateDocumentTitle,
    loading,
    error
  };
};
export default useUpdateDocumentTitle;
