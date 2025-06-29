import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
export const configModule = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath:
    process.env.NODE_ENV === 'production'
      ? '.env.production'
      : '.env.development.local',

  validationSchema: Joi.object({
    PORT: Joi.number().port().default(8080),
    API_PREFIX: Joi.string().default('api/v1'),
    CORS_ORIGIN: Joi.string().default('*'),
    DATABASE_URL: Joi.string()
      .uri()
      .regex(/mongodb(\+srv)?:\/\//)
      .required(),
    DATABASE_NAME: Joi.string().required(),
  }),
});
