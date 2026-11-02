
const { z } = require("zod");

const transactionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Category is required"),
});

module.exports = transactionSchema;
