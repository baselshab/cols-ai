import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'] || request.tenant?.tenantId;

    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required. Provide x-tenant-id header.');
    }

    if (!this.isValidUuid(tenantId)) {
      throw new BadRequestException('Invalid Tenant ID format');
    }

    if (request.tenant) {
      request.tenant.tenantId = tenantId;
    } else {
      request.tenant = { tenantId, userId: request.user?.userId, userRole: request.user?.role };
    }

    return true;
  }

  private isValidUuid(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }
}
