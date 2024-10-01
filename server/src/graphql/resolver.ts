import appDataSource from "src/db/datasource";
import { generateToken } from "../utils/auth";
import { Repository } from "typeorm";
import User from "src/entities/user.entity";
import { GraphQLError } from "graphql";
import Document from "src/entities/document.entity";
import * as Y from "yjs";
import moment from 'moment';
export interface ResolverContext {
  user?: User;
}

interface SignUpArgs {
  email: string;
  password: string;
}

interface SignInArgs {
  email: string;
  password: string;
}

interface SignInArgs {
  email: string;
  password: string;
}

interface DocumentArgs {
  id: string;
}

export const resolvers = {
  Query: {
    me: async (_: unknown, __: unknown, context: ResolverContext) => {
      const { user } = context;
      const userId = user?.id;
      if (!userId) {
        throw new GraphQLError("Unauthorized");
      }

      const userRepository: Repository<User> =
        appDataSource.getRepository(User);
      return await userRepository.findOneBy({ id: userId });
    },
    document: async (
      _: unknown,
      args: DocumentArgs,
      context: ResolverContext
    ) => {
      const { user } = context;
      if (!user) {
        throw new GraphQLError("Unauthorized");
      }

      const { id } = args;
      const documentRepository: Repository<Document> =
        appDataSource.getRepository(Document);

      const document = await documentRepository.findOne({
        where: { id },
        relations: ["owner"],
      });

      if (!document) {
        throw new GraphQLError("Document not found");
      }

      return document;
    },

    documents: async (_: unknown, args: { first?: number, after?: string, last?: number, before?: string }, context: ResolverContext) => {
      const { user } = context;
      if (!user) {
        throw new GraphQLError("Unauthorized");
      }

      try {
        const documentRepository: Repository<Document> = appDataSource.getRepository(Document);
        const limit = args.first || args.last || 10;
        const order: "ASC" | "DESC" = args.last ? "DESC" : "ASC";

        let query = documentRepository
          .createQueryBuilder("document")
          .leftJoinAndSelect("document.owner", "owner")  // Eagerly load the owner
          .orderBy("document.createdAt", order)
          .take(limit + 1);

        if (args.after) {
          const afterDate = moment(Buffer.from(args.after, 'base64').toString()).toDate();
          query = query.andWhere("document.createdAt > :after", { after: afterDate });
        } else if (args.before) {
          const beforeDate = moment(Buffer.from(args.before, 'base64').toString()).toDate();
          query = query.andWhere("document.createdAt < :before", { before: beforeDate });
        }

        const documents = await query.getMany();

        const hasNextPage = documents.length > limit;
        const hasPreviousPage = !!args.after || !!args.before;

        if (hasNextPage) {
          documents.pop();
        }

        if (args.last) {
          documents.reverse();
        }

        const edges = documents.map(doc => ({
          node: doc,
          cursor: Buffer.from(moment(doc.createdAt).toISOString()).toString('base64')
        }));

        return {
          edges,
          pageInfo: {
            hasNextPage,
            hasPreviousPage,
            startCursor: edges.length > 0 ? edges[0].cursor : null,
            endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
          }
        };
      } catch (error) {
        console.log(error);
        throw new GraphQLError("Error fetching documents");
      }
    },
  },

  Mutation: {
    signUp: async (_: unknown, args: SignUpArgs) => {
      const { email, password } = args;
      const userRepository: Repository<User> =
        appDataSource.getRepository(User);

      const existingUser = await userRepository.findOneBy({ email });
      if (existingUser) {
        throw new GraphQLError("User already exists.");
      }

      const user = userRepository.create({ email, password });
      await user.hashPassword();
      await userRepository.save(user);

      const token = generateToken(user.id);
      return { token, user };
    },

    signIn: async (_: unknown, args: SignInArgs) => {
      const { email, password } = args;
      const userRepository: Repository<User> =
        appDataSource.getRepository(User);

      const user = await userRepository.findOneBy({ email });
      if (!user) {
        throw new GraphQLError("Invalid email or password.");
      }

      const isValid = await user.checkPassword(password);
      if (!isValid) {
        throw new GraphQLError("Invalid email or password.");
      }

      const token = generateToken(user.id);
      return { token, user };
    },

    createBlankDocument: async (
      _: unknown,
      __: unknown,
      context: ResolverContext
    ) => {
      const { user } = context;
      if (!user) {
        throw new GraphQLError("Unauthorized");
      }

      try {
        const documentRepository: Repository<Document> =
          appDataSource.getRepository(Document);
        const snapshot = Y.encodeStateAsUpdate(new Y.Doc());
        const newDocument = documentRepository.create({
          name: "Untitled",
          owner: user,
          snapshot: new Uint8Array(snapshot),
        });

        await documentRepository.save(newDocument);

        return newDocument;
      } catch (error) {
        console.log(error);
        throw new GraphQLError("Error creating document");
      }
    },
    updateDocumentTitle: async (
      _: unknown,
      args: { id: string; name: string },
      context: ResolverContext
    ) => {
      const { user } = context;
      if (!user) {
        throw new GraphQLError("Unauthorized");
      }

      const { id, name } = args;
      const documentRepository: Repository<Document> =
        appDataSource.getRepository(Document);

      const document = await documentRepository.findOne({
        where: { id, owner: { id: user.id } },
        relations: ["owner"],
      });

      if (!document) {
        throw new GraphQLError("Document not found");
      }

      document.name = name;
      await documentRepository.save(document);

      return document;
    },
  },
};
