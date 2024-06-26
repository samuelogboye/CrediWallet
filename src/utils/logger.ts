import pino from "pino";
import pinoPretty from "pino-pretty";
import { join } from "path";
import fs from "fs";
import fsPromises from "fs/promises";

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

const logStream = fs.createWriteStream(logFilePath, { flags: "a" });
const prettyStream = pinoPretty({
  colorize: true, // Colorize the output
  translateTime: "yyyy-mm-dd HH:MM:ss.l", // Display timestamps in a human-readable format
  ignore: "pid,hostname", // Ignore the pid and hostname fields
});

const logger = pino(
  {
    level: process.env.LOG_LEVEL || "info",
    base: {
      pid: false,
    },
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
  },
  pino.multistream([
    { stream: prettyStream }, // Pretty print on console
    { stream: logStream }, // Log into a file
  ])
);

export default logger;
