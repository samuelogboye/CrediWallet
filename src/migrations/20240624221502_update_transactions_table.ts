import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("transactions", (table) => {
    table.decimal("money_in", 10, 2).defaultTo(0);
    table.decimal("money_out", 10, 2).defaultTo(0);
    table.string("recipient_to_from");
    table.string("description");
    table.decimal("balance", 10, 2);
    table.dropColumn("amount");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("transactions", (table) => {
    table.dropColumn("money_in");
    table.dropColumn("money_out");
    table.dropColumn("recipient_to_from");
    table.dropColumn("description");
    table.dropColumn("balance");
    table.decimal("amount", 10, 2);
  });
}
