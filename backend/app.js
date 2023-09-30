"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
var express_1 = require("express");
var body_parser_1 = require("body-parser");
var helmet_1 = require("helmet");
var api_routes_1 = require("./Routes/api.routes");
exports.app = (0, express_1.default)();
//Set Headers
exports.app.use(function (request, response, next) {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    next();
});
//Body Parser (Gets content from response body)
exports.app.use(body_parser_1.default.json());
exports.app.use(body_parser_1.default.urlencoded({ extended: true }));
//Helmet (Protect responses by setting specific headers)
exports.app.use((0, helmet_1.default)());
// API Routes
exports.app.use('/api', api_routes_1.default);
exports.default = exports.app;
