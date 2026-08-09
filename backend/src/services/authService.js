import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

export const register = async (userData) => {
  const { name, email, password, role } = userData;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    const err = new Error('User already exists with this email address');
    err.statusCode = 409;
    err.errorCode = 'USER_ALREADY_EXISTS';
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: passwordHash,
      role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return newUser;
};

export const login = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    err.errorCode = 'INVALID_CREDENTIALS';
    throw err;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    err.errorCode = 'INVALID_CREDENTIALS';
    throw err;
  }

  const jwtSecret = process.env.JWT_SECRET || 'minierpcrmsupersecretkey1234567890';
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    const err = new Error('User profile not found');
    err.statusCode = 404;
    err.errorCode = 'USER_NOT_FOUND';
    throw err;
  }

  return user;
};
