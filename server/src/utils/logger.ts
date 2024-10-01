import chalk from "chalk";
import moment from "moment";
import { createLogger, format, transports } from "winston";

const consoleFormat = format.combine(
  format.timestamp(),
  format.printf(({ timestamp, level, message }) => {
    const color = level === "error" ? "red" : "green";
    return `${chalk[color](
      "[" + level.toUpperCase() + "]",
    )} ${timestamp} - ${message}`;
  }),
);

const fileFormat = format.combine(format.timestamp(), format.json());

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  defaultMeta: { service: "your-service-name" },
  transports: [
    new transports.Console({
      format: consoleFormat,
    }),
    new transports.File({
      filename: "error.log",
      level: "error",
      format: fileFormat,
    }),
    new transports.File({ filename: "combined.log", format: fileFormat }),
  ],
});

// Custom log functions

export function logInfo(message: string) {
  console.log(
    `${chalk.green("[INFO]")} ${moment().format("YYYY-MM-DD HH:mm:ss")} - ${message}`
  );
}

export function logError(message: string, error?: unknown) {
  console.error(
    `${chalk.red("[ERROR]")} ${moment().format("YYYY-MM-DD HH:mm:ss")} - ${message}`,
    error instanceof Error ? error.message : error
  );
}

export function logRoom(message: string) {
  console.log(
    `${chalk.blue("[ROOM]")} ${moment().format("YYYY-MM-DD HH:mm:ss")} - ${message}`
  );
}

export default logger;
