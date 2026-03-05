import { z } from 'zod';
import { insertUserStatusSchema, userStatuses } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
};

export const userProfileSchema = z.object({
  id: z.string(),
  email: z.string().nullable().optional(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  profileImageUrl: z.string().nullable().optional(),
});

export const statusResponseSchema = z.object({
  currentStatus: z.string().nullable(),
  futureNotice: z.string().nullable(),
  updatedAt: z.string().or(z.date()),
});

export const api = {
  pairing: {
    generateCode: {
      method: 'POST' as const,
      path: '/api/pairing/code' as const,
      responses: {
        200: z.object({ code: z.string() }),
        401: errorSchemas.unauthorized,
      },
    },
    getCode: {
      method: 'GET' as const,
      path: '/api/pairing/code' as const,
      responses: {
        200: z.object({ code: z.string().nullable() }),
        401: errorSchemas.unauthorized,
      },
    },
    useCode: {
      method: 'POST' as const,
      path: '/api/pairing/use' as const,
      input: z.object({ code: z.string() }),
      responses: {
        200: z.object({ success: z.boolean() }),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    status: {
      method: 'GET' as const,
      path: '/api/pairing/status' as const,
      responses: {
        200: z.object({
          isPaired: z.boolean(),
          partner: userProfileSchema.nullable(),
        }),
        401: errorSchemas.unauthorized,
      },
    },
    unpair: {
        method: 'POST' as const,
        path: '/api/pairing/unpair' as const,
        responses: {
            200: z.object({ success: z.boolean() }),
            401: errorSchemas.unauthorized,
        }
    }
  },
  status: {
    getMine: {
      method: 'GET' as const,
      path: '/api/status/mine' as const,
      responses: {
        200: statusResponseSchema.nullable(),
        401: errorSchemas.unauthorized,
      },
    },
    getPartner: {
      method: 'GET' as const,
      path: '/api/status/partner' as const,
      responses: {
        200: statusResponseSchema.nullable(),
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/status' as const,
      input: z.object({
        currentStatus: z.string().nullable().optional(),
        futureNotice: z.string().nullable().optional(),
      }),
      responses: {
        200: statusResponseSchema,
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
