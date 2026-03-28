import { z } from 'zod';

export const caseSchema = z.object({
  caseNumber: z.string().min(1, 'Case number is required'),
  title: z.string().min(2, 'Title is required'),
  type: z.enum(['CIVIL', 'CRIMINAL', 'COMMERCIAL', 'FAMILY', 'LABOR', 'ADMINISTRATIVE', 'REAL_ESTATE', 'INTELLECTUAL_PROPERTY', 'BANKRUPTCY', 'OTHER']),
  clientId: z.string().uuid('Invalid client ID'),
  courtDate: z.string().optional(),
  courtName: z.string().optional(),
  description: z.string().optional(),
});

export const caseFilterSchema = z.object({
  status: z.enum(['ACTIVE', 'PENDING', 'CLOSED', 'ARCHIVED']).optional(),
  clientId: z.string().uuid().optional(),
});

export type CreateCaseInput = z.infer<typeof caseSchema>;
export type CaseFilterInput = z.infer<typeof caseFilterSchema>;
