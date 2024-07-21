import knex from "knex";
import knexConfig from "./src/config/knexfile";

const environment = "production";
// const environment = "development";

const db = knex(knexConfig[environment]);

async function dropAllTables() {
  try {
    // Disable foreign key checks
    // await db.raw("SET FOREIGN_KEY_CHECKS = 0");

    // Get the list of all tables
    const tables = await db("information_schema.tables")
      .select("table_name")
      .where("table_schema", db.client.database());
    console.log("tables", tables);

    // // Drop tables sequentially to avoid deadlocks
    // for (const table of tables) {
    //   try {
    //     console.log(`Dropping table: ${table.TABLE_NAME}`);
    //     await db.schema.dropTableIfExists(table.TABLE_NAME);
    //     console.log(`Dropped table: ${table.TABLE_NAME}`);
    //   } catch (dropError) {
    //     console.error(`Error dropping table ${table.TABLE_NAME}:`, dropError);
    //   }
    // }

    // // Re-enable foreign key checks
    // await db.raw("SET FOREIGN_KEY_CHECKS = 1");
  } catch (error) {
    console.error("Error fetching tables:", error);
  } finally {
    await db.destroy();
  }
}

dropAllTables();
