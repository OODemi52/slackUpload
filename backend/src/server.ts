import http from 'http';
import app from './app';

const normalizePort = (val: string) => {
  const port = parseInt(val, 10);

  if (isNaN(port) || port < 0) {
    return false;
  }
  return port;
};

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const errorHandler = (error: any) => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const server = http.createServer(app);

server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

server.listen(port, () => {
  console.log('Server started on port (test for github action)' + port);
});