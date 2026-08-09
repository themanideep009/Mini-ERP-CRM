import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { Role } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

export const registerUser = async (userData: {
  name: string;
  email: string;
  password: string;
  role: Role;
}) => {
  const { name, email, password, role } = userData;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    const error: AppError = new Error('User with this email already exists');
    error.statusCode = 409;
    error.errorCode = 'USER_ALREADY_EXISTS';
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

export const loginUser = async (credentials: { email: string; password: string }) => {
  const { email, password } = credentials;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const error: AppError = new Error('Invalid email or password');
    error.statusCode = 401;
    error.errorCode = 'INVALID_CREDENTIALS';
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const error: AppError = new Error('Invalid email or password');
    error.statusCode = 401;
    error.errorCode = 'INVALID_CREDENTIALS';
    throw error;
  }

  const secret = process.env.JWT_SECRET || 'minierpcrmsupersecretkey1234567890';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn: expiresIn as any }
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    const error: AppError = new Error('User not found');
    error.statusCode = 404;
    error.errorCode = 'USER_NOT_FOUND';
    throw error;
  }

  return user;
};

export const googleLoginUser = async (googleData: {
  email: string;
  name: string;
  role?: Role;
}) => {
  const { email, name, role } = googleData;

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Create new user for Google login
    const randomPass = Math.random().toString(36).slice(-10) + 'A1!';
    const hashedPassword = await bcrypt.hash(randomPass, 10);

    user = await prisma.user.create({
      data: {
        name: name || email.split('@')[0],
        email,
        password: hashedPassword,
        role: role || 'ADMIN',
      },
    });
  }

  const secret = process.env.JWT_SECRET || 'minierpcrmsupersecretkey1234567890';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn: expiresIn as any }
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

