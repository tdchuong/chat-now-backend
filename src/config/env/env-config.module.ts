import appConfig from '@/config/env/config/app.config';
import databaseConfig from '@/config/env/config/database.config';
import jwtConfig from '@/config/env/config/jwt.config';
import redisConfig from '@/config/env/config/redis.config';
import { validationSchema } from '@/config/env/validation';
import { ConfigModule } from '@nestjs/config';

export const Configs = [appConfig, databaseConfig, jwtConfig, redisConfig];
export const envConfigModule = ConfigModule.forRoot({
  isGlobal: true, // biến môi trường có thể truy cập toàn app
  load: Configs,
  validationSchema:validationSchema,
  validationOptions: {
    abortEarly: false, // Hiển thị tất cả errors
    allowUnknown: true, // Cho phép env vars không được định nghĩa
  },
  envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
  cache: true,
  expandVariables: true, //"http://${APP_HOST}:${APP_PORT}/api"
});
