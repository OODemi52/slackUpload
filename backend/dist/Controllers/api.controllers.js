"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFiles = exports.getChannels = void 0;
const slackbot_1 = __importDefault(require("../Models/slackbot"));
const getChannels = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slackbot = new slackbot_1.default();
        const channels = yield slackbot.getChannels();
        response.status(200).json(channels);
    }
    catch (error) {
        console.error(`Error fetching channels: ${error}`);
        response.status(500).json({ error: 'Failed to retrieve channels' });
    }
});
exports.getChannels = getChannels;
const uploadFiles = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { dirName, channel } = request.body;
    const slackbot = new slackbot_1.default(dirName, channel);
    try {
        yield slackbot.processFilesAndUpload(14); // Arg is max amount of images to send in one message (Slack currently uploads 14 max)
        response.status(200).json({ message: 'Files Uploaded Successfully!' });
    }
    catch (error) {
        console.error(`Error uploading files: ${error}`);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.uploadFiles = uploadFiles;
