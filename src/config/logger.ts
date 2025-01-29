import { join } from "path";
import fsPromises from "fs/promises";
import winston from "winston";
import { Loggly } from "winston-loggly-bulk";
import config from "../config/config";

// Ensure logs directory and log file exist
const logsDir = join(__dirname, "..", "..", "logs");
const logFilePath = join(logsDir, "app.log");

const ensureLogFileExists = async () => {
  try {
    await fsPromises.mkdir(logsDir, { recursive: true });
    await fsPromises.writeFile(logFilePath, "", { flag: "a" });
  } catch (error) {
    console.error("Error ensuring log file exists:", error);
  }
};

// Call the function to ensure the log file exists
ensureLogFileExists();

// Create a Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(
      ({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`
    )
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`
        )
      ),
    }),
    new winston.transports.File({ filename: logFilePath }),
  ],
});

// Add Loggly transport
// logger.add(
//   new Loggly({
//     token: config.loglyToken,
//     subdomain: "samogboye",
//     tags: ["Winston-NodeJS"],
//     json: true,
//   })
// );

export default logger;
