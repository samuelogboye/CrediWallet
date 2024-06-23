// Define the schema for the user table
export const userSchema = {
  id: "number",
  name: "string",
  email: "string",
  password: "string",
  account_number: "string",
  balance: "number",
  created_at: "date",
};

// Automatically get the allowed fields
export const allowedFields = Object.keys(userSchema);
