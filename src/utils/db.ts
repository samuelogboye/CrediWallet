import Knex from "knex";
import knexConfig from "../config/knexfile";

const environment = process.env.NODE_ENV;
const config = knexConfig[environment];

const knex = Knex(config);

export default knex;
