import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8080', 10),
  webName: process.env.WEB_NAME || 'chatnow',
  webUrl: process.env.WEB_URL || 'http://localhost:3000',
  apiPrefix: process.env.API_PREFIX || 'api/v1',
}));
