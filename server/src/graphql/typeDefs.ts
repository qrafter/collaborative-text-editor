import { gql } from "apollo-server-express";

export default gql`
  type User {
    id: ID!
    email: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Document {
    id: ID!
    name: String!
    content: String!
    createdAt: String!
    updatedAt: String!
    owner: User!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type DocumentEdge {
    node: Document!
    cursor: String!
  }

  type DocumentConnection {
    edges: [DocumentEdge!]!
    pageInfo: PageInfo!
  }

  type Query {
    me: User
    document(id: ID!): Document
    documents(first: Int, after: String, last: Int, before: String): DocumentConnection!
  }

  type Mutation {
    signUp(email: String!, password: String!): AuthPayload!
    signIn(email: String!, password: String!): AuthPayload!
    createBlankDocument: Document!
    updateDocumentTitle(id: ID!, name: String!): Document!
  }
`;