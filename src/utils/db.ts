import Knex from "knex";
import knexConfig from "../config/knexfile";
import config from "../config/config";

const environment = config.environment;
const configuration = knexConfig[environment];

const knex = Knex(configuration);

export default knex;
