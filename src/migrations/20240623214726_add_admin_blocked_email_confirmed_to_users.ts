import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table("users", (table) => {
    table.boolean("is_admin").defaultTo(false);
    table.boolean("is_blocked").defaultTo(false);
    table.boolean("is_email_confirmed").defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table("users", (table) => {
    table.dropColumn("is_admin");
    table.dropColumn("is_blocked");
    table.dropColumn("is_email_confirmed");
  });
}
