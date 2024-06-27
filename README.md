# CrediWallet

to run the app

npx nodemon --exec npx ts-node src/server.ts

to run the TypeScript files directly without compiling
npx ts-node src/server.ts

Using Compiled JavaScript Files
node dist/server.js

for migration
npx knex migrate:make create_users_table --knexfile src/config/knexfile.ts --env development
npx knex migrate:make create_transactions_table --knexfile src/config/knexfile.ts --env development

Run Migrations

Run the migrations to create the tables:
npx knex migrate:latest --knexfile src/config/knexfile.ts --env development

api swagger documantation http://localhost:3000/api/docs/
