import * as Joi from 'joi';

export const jwtValidation = Joi.object({
  JWT_PRIVATE_KEY: Joi.string().optional(),
  JWT_PUBLIC_KEY: Joi.string().optional(),
  JWT_ACCESS_EXPIRES_IN: Joi.number().default(900),
  JWT_REFRESH_EXPIRES_IN: Joi.number().default(1296000),
  JWT_REFRESH_TOKEN_MAX_LIFETIME: Joi.number().default(1296000),
});
