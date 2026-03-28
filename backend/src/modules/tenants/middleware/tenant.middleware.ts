import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId && !req.path.includes('/auth/login') && !req.path.includes('/auth/register')) {
      throw new BadRequestException('x-tenant-id header is required');
    }

    if (tenantId && !this.isValidUuid(tenantId)) {
      throw new BadRequestException('Invalid tenant ID format');
    }

    if (req.user) {
      req.tenant = {
        tenantId: tenantId || (req.user as { tenantId?: string }).tenantId,
        userId: (req.user as { userId?: string }).userId,
        userRole: (req.user as { role?: string }).role,
      };
    } else if (tenantId) {
      req.tenant = { tenantId, userId: undefined, userRole: undefined };
    }

    next();
  }

  private isValidUuid(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }
}

declare global {
  namespace Express {
    interface Request {
      tenant?: {
        tenantId: string;
        userId?: string;
        userRole?: string;
      };
    }
  }
}
