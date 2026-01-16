import { LoggerModule, Params } from 'nestjs-pino';

const getLogFileName = (type: 'app' | 'error' = 'app') => {
  const date = new Date();
  const yearMonthDay = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  return `logs/${type}-${yearMonthDay}.log`;
};

export const loggerConfig: Params = {
  pinoHttp: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    autoLogging: false, // Tắt log tự động của pinoHttp, dùng LoggingInterceptor
    redact: ['req.headers.authorization', 'req.headers["x-api-key"]'], // Loại bỏ thông tin nhạy cảm
    transport: {
      targets: [
        {
          target: 'pino-pretty',
          level: 'debug',
          options: {
            destination: 1, // Console
            translateTime: 'yyyy-mm-dd HH:MM:ss.l o', // Định dạng: 2025-06-29 10:41:00.123 +07:00
            ignore: 'pid,hostname,context,req,res', // Bỏ các trường không cần thiết
          },
        },
        {
          target: 'pino/file',
          level: 'debug',
          options: {
            destination: getLogFileName('app'), // File: logs/app-2025-06-29.log
            mkdir: true,
          },
        },
        {
          target: 'pino/file',
          level: 'error',
          options: {
            destination: getLogFileName('error'), // File: logs/error-2025-06-29.log
            mkdir: true,
          },
        },
      ],
    },
    timestamp: () => `,"time":"${new Date().toISOString()}"`, // Timestamp ISO
  },
};

export const loggerModule = LoggerModule.forRoot(loggerConfig);
