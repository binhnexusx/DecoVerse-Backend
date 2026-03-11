import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: any }>(); 
    const user = request.user;

    return data ? user?.[data as keyof typeof user] : user;
  },
);