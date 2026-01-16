import * as Joi from 'joi';

export const databaseValidation = Joi.object({
  DATABASE_HOST: Joi.string().default('localhost'),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USERNAME: Joi.string().default('postgres'),
  DATABASE_PASSWORD: Joi.string().default('postgres'),
  DATABASE_NAME: Joi.string().default('chatdb'),
  DATABASE_URL: Joi.string().allow('').optional(),
});
