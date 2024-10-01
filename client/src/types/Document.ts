import { User } from "./User";

export type Document = {
  id: string;
  name: string;
  content: string;
  snapshot: object | null;
  owner: User;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};
export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface DocumentEdge {
  node: Document;
  cursor: string;
}

export interface DocumentConnection {
  edges: DocumentEdge[];
  pageInfo: PageInfo;
}

export interface GetDocumentsData {
  documents: DocumentConnection;
}

export interface GetDocumentsVariables {
  first?: number | null;
  after?: string | null;
  last?: number | null;
  before?: string | null;
}