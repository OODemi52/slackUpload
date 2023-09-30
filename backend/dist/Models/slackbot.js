"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv = __importStar(require("dotenv"));
const web_api_1 = require("@slack/web-api");
dotenv.config();
class SlackBot {
    constructor(dirName, channel) {
        var _a;
        this.client = new web_api_1.WebClient(process.env.SLACK_TOKEN);
        this.sdCardPath = (_a = process.env.SD_CARD_PATH) !== null && _a !== void 0 ? _a : '';
        this.dirName = dirName || '';
        this.channel = channel || '';
        this.absDir = path.join(this.sdCardPath, this.dirName);
    }
    getChannels() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.client.conversations.list();
                return (_b = (_a = result.channels) === null || _a === void 0 ? void 0 : _a.map((channel) => [`${channel.id}`, `${channel.name}`])) !== null && _b !== void 0 ? _b : [];
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    processFilesAndUpload(message_length) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = yield this.readFilesFromDirectory();
            const sortedFiles = this.filterAndSortFiles(files);
            const files_upload = [];
            for (let i = 0; i < sortedFiles.length; i++) {
                const filename = sortedFiles[i];
                const file = path.join(this.absDir, filename);
                files_upload.push({ file, filename });
                console.log(files_upload);
                if ((i + 1) % message_length === 0 || i === sortedFiles.length - 1) {
                    yield this.uploadFileToSlackChannel(files_upload);
                    files_upload.length = 0;
                }
            }
        });
    }
    readFilesFromDirectory() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield fs.promises.readdir(this.absDir);
            }
            catch (err) {
                console.error(`Error reading directory: ${err}`);
                throw err;
            }
        });
    }
    filterAndSortFiles(files) {
        const pattern = /^IMG_.+\.JPG$/;
        const filteredFiles = files.filter((file) => pattern.test(file));
        return filteredFiles.sort();
    }
    uploadFileToSlackChannel(file_uploads) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const currentDate = new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                });
                yield this.client.files.uploadV2({
                    channel_id: this.channel,
                    initial_comment: currentDate,
                    file_uploads: file_uploads,
                });
                console.log(`Uploaded files to Slack`);
            }
            catch (error) {
                if (error.code === 'slack_error_code') {
                    console.error(`Error uploading files to Slack: ${error.message}`);
                }
                else {
                    console.error(`Unexpected error: ${error}`);
                }
                throw error;
            }
        });
    }
}
exports.default = SlackBot;
