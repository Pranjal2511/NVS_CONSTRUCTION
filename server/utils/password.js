import bcrypt from 'bcryptjs';
import env from '../config/env.js';

export const hashPassword = async (password) => bcrypt.hash(password, env.BCRYPT_ROUNDS);

export const comparePassword = async (password, hash) => bcrypt.compare(password, hash);

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const validatePasswordStrength = (password) => PASSWORD_REGEX.test(password);
