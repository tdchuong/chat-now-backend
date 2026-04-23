import argon2 from 'argon2';

export const hashPassword = (password: string) => {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64MB
    timeCost: 3,
    parallelism: 1,
  });
};

export const verifyPassword = (hash: string, password: string) => {
  return argon2.verify(hash, password);
};
