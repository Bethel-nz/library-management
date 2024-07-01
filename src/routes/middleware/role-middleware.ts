import { Context, MiddlewareHandler } from 'hono';
import { Role, User } from '~global';

const role_middleware = (requiredRole: Role): MiddlewareHandler => {
  return async (c: Context, next: Function) => {
    const user = c.get('user') as User;
    if (!user) {
      return c.json({ message: 'Unauthorized: No user found' }, 401);
    }

    const isGetMethod = c.req.method === 'GET';

    if (
      user.role === requiredRole ||
      (user.role === 'STUDENT' && isGetMethod)
    ) {
      await next();
    } else {
      return c.json({ message: 'Forbidden: Access denied' }, 403);
    }
  };
};

export default role_middleware;
