import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().trim()
    .min(5, "Le titre doit contenir au moins 5 caractères.")
    .max(100, "Le titre ne peut pas dépasser 100 caractères."),
  description: z.string()
    .min(10, "La description doit contenir au moins 10 caractères.")
    .max(500, "La description ne peut pas dépasser 500 caractères."),
  duration: z.number()
    .min(1, "La durée doit être au moins 1 heure.")
    .max(200, "La durée ne peut pas dépasser 200 heures."),
  maxStudents: z.number()
    .min(5, "Le nombre maximum d'étudiants doit être au moins 5.")
    .max(100, "Le nombre maximum d'étudiants ne peut pas dépasser 100."),
  price: z.number()
    .min(0, "Le prix ne peut pas être négatif.")
    .max(10000, "Le prix ne peut pas dépasser 10 000."),
  level: z.enum(["Beginner", "Intermediate", "Advanced"])
    .refine(val => ["Beginner", "Intermediate", "Advanced"].includes(val), {
      message: "Le niveau doit être 'Beginner', 'Intermediate' ou 'Advanced'."
    }),
  instructorId: z.string().nonempty("L'identifiant du formateur est obligatoire."),
});

export const updateCourseSchema = createCourseSchema.partial();

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
