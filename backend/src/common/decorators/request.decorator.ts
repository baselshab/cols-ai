import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface TenantInfo {
  tenantId: string;
  userId: string;
  userRole: string;
}

export const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenant?.tenantId || request.headers['x-tenant-id'];
  },
  parameterIndex: 0,
);

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TenantInfo => {
    const request = ctx.switchToHttp().getRequest();
    return request.user || request.tenant;
  },
  parameterIndex: 0,
);

export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.userId || request.tenant?.userId;
  },
  parameterIndex: 0,
);
