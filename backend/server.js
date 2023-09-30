"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var app_1 = require("./app");
var normalizePort = function (val) {
    var port = parseInt(val, 10);
    if (isNaN(port) || port < 0) {
        return false;
    }
    return port;
};
var port = normalizePort(process.env.PORT || '3000');
app_1.app.set('port', port);
var errorHandler = function (error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    var address = server.address();
    var bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
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
var server = http_1.default.createServer(app_1.app);
server.on('error', errorHandler);
server.on('listening', function () {
    var address = server.address();
    var bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
    console.log('Listening on ' + bind);
});
server.listen(port, function () {
    console.log('Server started on port ' + port);
});
