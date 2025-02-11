import {z} from 'zod';

export const messagechema = z.object({
   content: z.string()
   .min(10, {message: "Message must be at least 10 characters long"})
   .max(300, {message: "Message must be less than 300 characters long"})
})