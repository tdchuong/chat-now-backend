const ApiResponse = <T>(data: T) => ({
  statusCode: 200,
  message: 'Request Success',
  data,
  timestamp: new Date().toISOString(),
});
