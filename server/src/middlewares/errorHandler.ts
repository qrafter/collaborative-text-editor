import { type Request, type Response } from "express";
import { type UnauthorizedError } from "express-oauth2-jwt-bearer";
import logger from "src/utils/logger";

const errorHandler = (
  err: UnauthorizedError,
  req: Request,
  res: Response,
): void => {
  console.log(err);
  logger.error(`${req.method} ${req.url} - ${err.message}`, {
    stack: err.stack, // Log the stack trace (if available)
  });
  if (err.status === 401) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const response: { message: string; details?: string } = {
    message: "Internal Server Error",
  };

  if (process.env.NODE_ENV !== "production") {
    response.details = err.message;
  }

  res.status(500).send(response);
};

export default errorHandler;
