import { z } from "zod";

export interface UserSession {
  id: number;
  correo: string;
  unidad_id: number;
  nombre: string;
  cargo: string;
  roles: string[];
  created_at: string;
}

export const LoginFormSchema = z.object({
  email: z.string().min(1, "El correo no puede estar vacío"),
  domain: z.string(),
  password: z.string(),
});

export type UserSTDForm = z.output<typeof LoginFormSchema>;
