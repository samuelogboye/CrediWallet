import knex from "knex";
import knexConfig from "./src/config/knexfile";
import config from "./src/config/config";

const environment = "development"; //config.environment;
const db = knex(knexConfig[environment]);

async function listTablesAndColumns() {
  try {
    // Retrieve the current database name
    const tables = await db("information_schema.tables")
      .select("table_name")
      .where("table_schema", db.client.database());

    for (const table of tables) {
      console.log(`Table: ${table.TABLE_NAME}`);
      const columns = await db("information_schema.columns")
        .select("column_name")
        .where({
          table_name: table.TABLE_NAME,
        });

      columns.forEach((column) => {
        console.log(`  Column: ${column.column_name} - ${column.data_type}`);
      });
    }
  } catch (error) {
    console.error("Error fetching tables and columns:", error);
  } finally {
    await db.destroy();
  }
}

listTablesAndColumns();
