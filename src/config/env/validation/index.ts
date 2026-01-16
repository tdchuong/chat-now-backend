import * as Joi from 'joi';
import { appValidation } from './app.validation';
import { databaseValidation } from './database.validation';
import { jwtValidation } from './jwt.validation';
import { redisValidation } from '@/config/env/validation/redis.validation';

export const validationSchema = Joi.object({})
  .concat(appValidation)
  .concat(databaseValidation)
  .concat(jwtValidation)
  .concat(redisValidation);
