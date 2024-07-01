import { Context, Hono } from 'hono';
import {
  generateToken,
  hashPassword,
  comparePassword,
  isEmailAvailable,
  secret,
  refreshSecret,
} from '~utils/auth';
import { setSignedCookie } from 'hono/cookie';
import drizzle from '~drizzle';
import { userRole, users } from '~drizzle/models';
import { Role } from '~global';
import { eq } from 'drizzle-orm';
import * as z from 'zod';
import { ENV } from '~utils';

const auth = new Hono();

const passwordSchema: z.ZodString = z
  .string()
  .min(6, { message: 'Password must be at least 6 characters long' })
  .max(12, { message: 'Password must be at most 12 characters long' });

const emailSchema: z.ZodString = z
  .string()
  .email({ message: 'Invalid email format' });

auth.post('/register/:role', async (c: Context) => {
  try {
    const { username, password, email } = await c.req.json();
    const role = c.req.param('role').toUpperCase() as unknown as Role;

    if (!userRole.enumValues.includes(role)) {
      return c.json({ message: 'Invalid role' }, 400);
    }
    const isValidPassWord = passwordSchema.safeParse(password);
    const isValidEmail = emailSchema.safeParse(email);

    if (!isValidPassWord.success)
      return c.json(
        {
          error: isValidPassWord.error.message,
          details: isValidPassWord.error.issues,
        },
        400
      );

    if (!isValidEmail.success)
      return c.json(
        {
          error: isValidEmail.error.message,
          details: isValidEmail.error.issues,
        },
        400
      );

    if (await isEmailAvailable(email))
      return c.json({ message: 'Email already exist!' }, 400);

    const hashedPassword: string = hashPassword(password);

    const [newUser] = await drizzle
      .insert(users)
      .values({
        username,
        password: hashedPassword,
        email,
        role,
      })
      .returning();

    if (!newUser) {
      return c.json({ message: 'User registration failed' }, 500);
    }
    const token = generateToken(newUser, '15m');
    const refreshToken = generateToken(newUser, '7d');

    await setSignedCookie(c, 'lb_token', token!, secret, {
      httpOnly: true,
      secure: ENV,
      sameSite: 'Strict',
      maxAge: 900,
    });
    await setSignedCookie(c, 'lb_refresh_token', refreshToken!, refreshSecret, {
      httpOnly: true,
      secure: ENV,
      sameSite: 'Strict',
      maxAge: 604800,
    });

    return c.json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error(error);
    return c.json({ message: 'Internal Server Error' }, 500);
  }
});

auth.post('/login', async (c: Context) => {
  try {
    const { email, password } = await c.req.json();
    const [user] = await drizzle
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user || !comparePassword(password, user.password)) {
      return c.json({ message: 'Invalid credentials' }, 401);
    }

    const token = generateToken(user, '15m');
    const refreshToken = generateToken(user, '7d');

    await setSignedCookie(c, 'lb_token', token!, secret, {
      httpOnly: true,
      secure: ENV,
      sameSite: 'Strict',
      maxAge: 900,
    });
    await setSignedCookie(c, 'lb_refresh_token', refreshToken!, refreshSecret, {
      httpOnly: true,
      secure: ENV,
      sameSite: 'Strict',
      maxAge: 604800,
    });

    return c.json({ message: 'Login successful', user });
  } catch (error) {
    console.error(error);
    return c.json({ message: 'Internal Server Error' }, 500);
  }
});

export default auth;
