import { z } from "zod";

export const createUserSchema = z.object({
  username: z
    .string()
    .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères.")
    .max(30, "Le nom d'utilisateur ne peut pas dépasser 30 caractères."),
  email: z.string().email("Le format de l'email est invalide."),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères."),
  firstName: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères."),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  role: z
    .enum(["Student", "Instructor", "Admin"])
    .refine((val) => ["Student", "Instructor", "Admin"].includes(val), {
      message: "Le role doit être 'Student', 'Instructor' ou 'Admin'.",
    })
    .default("Student"),
});

export const updateUserSchema = createUserSchema
  .partial()
  .extend({ id: z.uuid() });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
