import { Context, MiddlewareHandler, Next } from 'hono';
import drizzle from '~drizzle';
import { users } from '~drizzle/models';
import { getSignedCookie, setSignedCookie } from 'hono/cookie';
import { generateToken, verifyToken, secret, refreshSecret } from '~utils/auth';
import { eq } from 'drizzle-orm';
import { User } from '~global';
import { ENV } from '~utils/index';

const authMiddleware: MiddlewareHandler = async (c: Context, next: Next) => {
  let token: string | undefined;
  let refreshToken: string | undefined;

  try {
    token = (await getSignedCookie(c, secret, 'lb_token')) as string;
    refreshToken = (await getSignedCookie(
      c,
      refreshSecret,
      'lb_refresh_token'
    )) as string;

    if (!token && !refreshToken) {
      return c.json({ message: 'Unauthorized: No token provided' }, 401);
    }

    if (token) {
      const decoded = verifyToken(token, secret);
      const user = await drizzle.query.users.findFirst({
        where: eq(users.email, decoded!.email),
      });
      c.set('user', user);
      if (!user) {
        return c.json({ message: 'Unauthorized: User not found' }, 401);
      }
    } else if (refreshToken) {
      const decodedRefresh = verifyToken(refreshToken, refreshSecret) as User;
      if (decodedRefresh) {
        const newToken = generateToken(decodedRefresh, '15m');
        await setSignedCookie(c, 'lb_token', newToken!, secret, {
          httpOnly: true,
          secure: ENV,
          sameSite: 'Strict',
          maxAge: 900,
        });
        c.set('user', decodedRefresh);
      }
    }

    await next();
  } catch (error) {
    console.error(error);
    return c.json({ message: 'Unauthorized: Invalid token' }, 401);
  }
};

export default authMiddleware;
