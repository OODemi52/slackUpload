"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const api_controllers_1 = require("../Controllers/api.controllers");
const router = express_1.default.Router();
// Attach HTTP methods to the various API routes:
router.get('/getChannels', api_controllers_1.getChannels);
router.post('/uploadFiles', api_controllers_1.uploadFiles);
exports.default = router;
