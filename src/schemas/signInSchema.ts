import {z} from 'zod';

export const signInSchema = z.object({
    // email: z.string().email(),
    identifier: z.string().email().or(z.string().min(3)), 
    password: z.string(),
})