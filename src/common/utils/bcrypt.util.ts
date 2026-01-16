import { compare } from 'bcryptjs';

export function comparePassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return compare(plainPassword, hashedPassword);
}
