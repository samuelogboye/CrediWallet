import knex from "knex";
import config from "./config/config";
import knexfile from "./config/knexfile";

const environment = process.env.NODE_ENV || "development";
const dbConfig = knexfile[environment];
const db = knex(dbConfig);

async function unlockMigrationTable() {
  try {
    const migrationTable = "knex_migrations_lock";
    await db(migrationTable).where({ is_locked: 1 }).update({ is_locked: 0 });
    console.log("Migration table unlocked");
  } catch (error) {
    console.error("Error unlocking migration table:", error);
  }
}

async function migrate() {
  try {
    console.log(`Running migrations for ${environment} environment`);
    await db.migrate.latest();
    console.log("Migrations ran successfully");
  } catch (error) {
    const err = error as Error;
    if (err.message.includes("Migration table is already locked")) {
      console.error("Migration table is locked. Attempting to unlock...");
      await unlockMigrationTable();
      console.log("Running migrations again...");
      await db.migrate.latest();
      console.log("Migrations ran successfully after unlocking");
    } else {
      console.error("Error running migrations:", error);
    }
  } finally {
    await db.destroy();
  }
}

migrate();
