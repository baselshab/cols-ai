import { Injectable, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';

@Injectable()
export class ThrottleGuard extends ThrottlerGuard {
  protected throwThrottlingException(context: ExecutionContext): void {
    throw new ThrottlerException('Too many requests, please try again later.');
  }

  protected getTracker(req: Record<string, unknown>): string {
    const user = req['user'] as { id?: string } | undefined;
    return user?.id || (req['ip'] as string) || 'unknown';
  }
}
