import { z } from "zod";

export const createEnrollmentSchema = z.object({
  courseId: z.string().nonempty("L'identifiant du cours est obligatoire."),
  studentId: z.string().nonempty("L'identifiant de l'étudiant est obligatoire."),
  status: z.enum(["Active", "Completed", "Cancelled"]).optional(),
  grade: z.number().min(0, "La note ne peut pas être négative.")
           .max(100, "La note ne peut pas dépasser 100.")
           .optional(),
});

export const updateEnrollmentSchema = createEnrollmentSchema.partial();

export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
export type UpdateEnrollmentInput = z.infer<typeof updateEnrollmentSchema>;
