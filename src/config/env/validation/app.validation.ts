import * as Joi from 'joi';

export const appValidation = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),
  PORT: Joi.number().default(8080),
  WEB_NAME: Joi.string().default('chatnow'),
  WEB_URL: Joi.string().uri().default('http://localhost:3000'),
  API_PREFIX: Joi.string().default('api/v1'),
});
