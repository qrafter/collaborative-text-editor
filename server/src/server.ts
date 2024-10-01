import { createServer } from "node:http";
import { createSchema, createYoga } from "graphql-yoga";
import typeDefs from "./graphql/typeDefs";
import { resolvers } from "./graphql/resolver";
import createConnection from "./db/connection";
import chalk from "chalk";
import moment from "moment";
import appDataSource from "./db/datasource";
import { verifyToken } from "./utils/auth";
import User from "./entities/user.entity";

const PORT = process.env.PORT || 5001;

const schema = createSchema({
  typeDefs,
  resolvers,
});

const createContext = async ({
  request,
  connectionParams,
}: {
  request?: Request;
  connectionParams?: Record<string, unknown>;
}) => {
  const authHeader = (
    request
      ? request.headers.get("authorization")
      : connectionParams?.Authorization
  ) as string | undefined;

  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    try {
      const decodedToken = verifyToken(token);
      const userRepository = appDataSource.getRepository(User);
      const userId = (decodedToken as { userId?: string })?.userId;
      if (!userId) {
        console.error("Invalid token");
        return { user: null };
      }
      const user = await userRepository.findOne({ where: { id: userId } });
      return { user };
    } catch (err) {
      console.error("Invalid or expired token");
      return { user: null };
    }
  }
  return { user: null };
};

const yogaApp = createYoga({
  schema,
  cors: {
    origin: "*",
    credentials: true,
  },
  context: createContext,
});

const httpServer = createServer(yogaApp);

createConnection()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(
        `${chalk.green("[INFO]")} ${moment().format(
          "YYYY-MM-DD HH:mm:ss"
        )} - GraphQL server is running on http://localhost:${PORT}/graphql`
      );
    });
  })
  .catch((err) => {
    console.error(err);
  });
