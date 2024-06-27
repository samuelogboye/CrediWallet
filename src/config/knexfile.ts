import { Knex } from "knex";
import config from "../config/config";

const knexConfig: { [key: string]: Knex.Config } = {
  development: {
    client: "mysql2",
    connection: {
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      port: config.db.port,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "../migrations",
    },
    seeds: {
      directory: "../seeds",
    },
  },

  test: {
    client: "sqlite3",
    connection: {
      filename: ":memory:",
    },
    useNullAsDefault: true,
    migrations: {
      directory: "../migrations",
    },
    seeds: {
      directory: "../seeds",
    },
  },

  production: {
    client: "mysql2",
    connection: {
      host: config.prodDb.host,
      user: config.prodDb.user,
      password: config.prodDb.password,
      database: config.prodDb.database,
      port: config.prodDb.port,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "../migrations",
    },
    seeds: {
      directory: "../seeds",
    },
  },
};

export default knexConfig;
