import { gql, useQuery, ApolloQueryResult } from "@apollo/client";
import { toast } from "react-toastify";
import { useState } from "react";
import { PageInfo, GetDocumentsData, GetDocumentsVariables, Document } from "../types/Document";

export const GET_PAGINATED_DOCUMENTS = gql`
  query GetPaginatedDocuments($first: Int, $after: String, $last: Int, $before: String) {
    documents(first: $first, after: $after, last: $last, before: $before) {
      edges {
        node {
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
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

interface UseGetDocumentsResult {
  documents: Document[];
  pageInfo: PageInfo;
  loading: boolean;
  error?: Error;
  loadNext: () => Promise<void>;
  loadPrevious: () => Promise<void>;
}

const useGetDocuments = (itemsPerPage: number = 10): UseGetDocumentsResult => {
  const [cursors, setCursors] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  const { data, loading, error, fetchMore } = useQuery<GetDocumentsData, GetDocumentsVariables>(GET_PAGINATED_DOCUMENTS, {
    variables: { 
      first: itemsPerPage,
      after: currentPage > 0 ? cursors[currentPage - 1] : null,
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const loadNext = async (): Promise<void> => {
    if (data?.documents.pageInfo.hasNextPage) {
      const result: ApolloQueryResult<GetDocumentsData> = await fetchMore({
        variables: {
          first: itemsPerPage,
          after: data.documents.pageInfo.endCursor,
          last: null,
          before: null,
        },
      });
      
      if (result.data.documents.edges.length > 0) {
        setCursors([...cursors, data.documents.pageInfo.endCursor || '']);
        setCurrentPage(currentPage + 1);
      }
    }
  };

  const loadPrevious = async (): Promise<void> => {
    if (currentPage > 0) {
      const newPage = currentPage - 1;
      const result: ApolloQueryResult<GetDocumentsData> = await fetchMore({
        variables: {
          first: itemsPerPage,
          after: newPage > 0 ? cursors[newPage - 1] : null,
          last: null,
          before: null,
        },
      });
      
      if (result.data.documents.edges.length > 0) {
        setCurrentPage(newPage);
      }
    }
  };

  return {
    documents: data?.documents.edges.map(edge => edge.node) ?? [],
    pageInfo: {
      ...data?.documents.pageInfo,
      hasPreviousPage: currentPage > 0,
    } as PageInfo,
    loading,
    error,
    loadNext,
    loadPrevious,
  };
};

export default useGetDocuments;