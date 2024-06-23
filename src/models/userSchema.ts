export const userSchema = {
  id: { type: "increments", primary: true },
  name: { type: "string", maxLength: 100, notNullable: true },
  email: { type: "string", maxLength: 100, unique: true, notNullable: true },
  password: { type: "string", maxLength: 100, notNullable: true },
  account_number: {
    type: "string",
    maxLength: 100,
    unique: true,
    notNullable: true,
  },
  balance: { type: "decimal", precision: 10, scale: 2, defaultTo: 0.0 },
  created_at: { type: "timestamp", defaultTo: "now" },
  is_admin: { type: "boolean", defaultTo: false },
  is_blocked: { type: "boolean", defaultTo: false },
  is_email_confirmed: { type: "boolean", defaultTo: false },
};

// Automatically get the allowed fields
export const allowedFields = Object.keys(userSchema);
