import { Role } from "@/types/types";
import { z } from "zod";

export const CreateUserSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(Role, {required_error: "Role is required"})
 
});
export type CreateUserValues = z.infer<typeof CreateUserSchema>;

export const SignupUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
 
});
export type SignupUserValues = z.infer<typeof SignupUserSchema>;