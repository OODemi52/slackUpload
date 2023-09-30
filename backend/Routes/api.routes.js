"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var api_controllers_1 = require("../Controllers/api.controllers");
var router = express_1.default.Router();
// Attach HTTP methods to the various API routes:
router.get('/getChannels', api_controllers_1.getChannels);
router.post('/uploadFiles', api_controllers_1.uploadFiles);
exports.default = router;
