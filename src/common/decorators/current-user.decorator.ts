import { AuthRequest } from '@/features/auth/guards/jwt-auth.guard';
import { AccessTokenPayload } from '@/features/auth/services/token.service';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (field: keyof AccessTokenPayload, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<AuthRequest>();
    return field ? req.user?.[field] : req.user;
  },
);
