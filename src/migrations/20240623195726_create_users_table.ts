import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.string("name", 100).notNullable();
    table.string("email", 100).unique().notNullable();
    table.string("password", 100).notNullable();
    table.string("account_number", 100).unique().notNullable();
    table.decimal("balance", 10, 2).defaultTo(0.0);
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("users");
}
