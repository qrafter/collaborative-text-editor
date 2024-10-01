import { type Request, type Response } from "express";
import responseTime from "response-time";
import logger from "src/utils/logger";

const requestLogger = responseTime(
  (req: Request, res: Response, time: number) => {
    logger.info(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${time.toFixed(2)}ms`,
    );
  },
);

export default requestLogger;
