import express from "express";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const swaggerDocument = yaml.load(
  fs.readFileSync(path.join(__dirname, "../../swagger.yaml"), "utf8")
);

const setupSwagger = (app: express.Application): void => {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

export default setupSwagger;
