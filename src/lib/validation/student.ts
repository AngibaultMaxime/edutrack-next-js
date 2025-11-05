import { z } from "zod";

export const createStudentSchema = z.object({
  firstName: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères.")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères."),
  lastName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(50, "Le nom ne peut pas dépasser 50 caractères."),
  email: z.email("Le format de l'email est invalide."),
  registrationDate: z.preprocess(
    (arg) => (typeof arg === "string" ? new Date(arg) : arg),
    z
      .date()
      .max(new Date(), "La date d'inscription ne peut pas être dans le futur.")
  ),
  level: z
    .enum(["Beginner", "Intermediate", "Advanced"])
    .refine((val) => ["Beginner", "Intermediate", "Advanced"].includes(val), {
      message: "Le niveau doit être 'Beginner', 'Intermediate' ou 'Advanced'.",
    }),
});

export const updateStudentSchema = createStudentSchema.partial();

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
