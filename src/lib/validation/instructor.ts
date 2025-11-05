import { z } from "zod";

export const createInstructorSchema = z.object({
  firstName: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères.")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères."),
  lastName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(50, "Le nom ne peut pas dépasser 50 caractères."),
  specialty: z
    .string()
    .min(3, "La spécialité doit contenir au moins 3 caractères.")
    .max(100, "La spécialité ne peut pas dépasser 100 caractères."),
  email: z.email("Le format de l'email est invalide."),
  hireDate: z.preprocess(
    (arg) => (typeof arg === "string" ? new Date(arg) : arg),
    z
      .date()
      .max(new Date(), "La date d'embauche ne peut pas être dans le futur.")
  ),
});

export const updateInstructorSchema = createInstructorSchema.partial();

export type CreateInstructorInput = z.infer<typeof createInstructorSchema>;
export type UpdateInstructorInput = z.infer<typeof updateInstructorSchema>;
