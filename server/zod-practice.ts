import { z } from "zod";

const signupSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: z.string().min(8),
});

function validateSignup(input: unknown) {
  const result = signupSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  return { success: true, data: result.data };
}

const testInput: unknown = {
  name: "  Vibhav  ",
  email: "  dev@example.com  ",
  password: "securepass123",
};

console.log(validateSignup(testInput));