export type User = {
  id: string;
  email: string;
  password: string;
  ownedDocuments: Document[];
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};