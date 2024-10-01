import { gql, useMutation } from "@apollo/client";
import { toast } from "react-toastify";

interface CreateBlankDocumentResponse {
  createBlankDocument: {
    id: string;
    name: string;
  };
}

export const CREATE_BLANK_DOCUMENT = gql`
  mutation CreateBlankDocument {
    createBlankDocument {
      id
      name
    }
  }
`;

const useCreateBlankDocument = () => {
  const [createBlankDocument, { data, error, loading }] =
    useMutation<CreateBlankDocumentResponse>(CREATE_BLANK_DOCUMENT, {
      onError: (error) => {
        toast.error(error.message);
      },
    });

  return {
    createBlankDocument,
    document: data?.createBlankDocument,
    loading,
    error,
  };
};

export default useCreateBlankDocument;
