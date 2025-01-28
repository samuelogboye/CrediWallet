import knex from "knex";
import knexConfig from "./src/config/knexfile";

const environment = "production";

const db = knex(knexConfig[environment]);

async function dropAllTables() {
  try {
    // Get the list of all tables
    const tables = await db("information_schema.tables")
      .select("table_name")
      .where("table_schema", db.client.database());
  } catch (error) {
    console.error("Error fetching tables:", error);
  } finally {
    await db.destroy();
  }
}

dropAllTables();
