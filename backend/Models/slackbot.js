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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var dotenv = require("dotenv");
var web_api_1 = require("@slack/web-api");
dotenv.config();
var SlackBot = /** @class */ (function () {
    function SlackBot(dirName, channel) {
        var _a;
        this.client = new web_api_1.WebClient(process.env.SLACK_TOKEN);
        this.sdCardPath = (_a = process.env.SD_CARD_PATH) !== null && _a !== void 0 ? _a : '';
        this.dirName = dirName || '';
        this.channel = channel || '';
        this.absDir = path.join(this.sdCardPath, this.dirName);
    }
    SlackBot.prototype.getChannels = function () {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var result, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.conversations.list()];
                    case 1:
                        result = _c.sent();
                        return [2 /*return*/, (_b = (_a = result.channels) === null || _a === void 0 ? void 0 : _a.map(function (channel) { return ["".concat(channel.id), "".concat(channel.name)]; })) !== null && _b !== void 0 ? _b : []];
                    case 2:
                        error_1 = _c.sent();
                        console.error(error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SlackBot.prototype.processFilesAndUpload = function (message_length) {
        return __awaiter(this, void 0, void 0, function () {
            var files, sortedFiles, files_upload, i, filename, file;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.readFilesFromDirectory()];
                    case 1:
                        files = _a.sent();
                        sortedFiles = this.filterAndSortFiles(files);
                        files_upload = [];
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < sortedFiles.length)) return [3 /*break*/, 5];
                        filename = sortedFiles[i];
                        file = path.join(this.absDir, filename);
                        files_upload.push({ file: file, filename: filename });
                        console.log(files_upload);
                        if (!((i + 1) % message_length === 0 || i === sortedFiles.length - 1)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.uploadFileToSlackChannel(files_upload)];
                    case 3:
                        _a.sent();
                        files_upload.length = 0;
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SlackBot.prototype.readFilesFromDirectory = function () {
        return __awaiter(this, void 0, void 0, function () {
            var err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, fs.promises.readdir(this.absDir)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        err_1 = _a.sent();
                        console.error("Error reading directory: ".concat(err_1));
                        throw err_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SlackBot.prototype.filterAndSortFiles = function (files) {
        var pattern = /^IMG_.+\.JPG$/;
        var filteredFiles = files.filter(function (file) { return pattern.test(file); });
        return filteredFiles.sort();
    };
    SlackBot.prototype.uploadFileToSlackChannel = function (file_uploads) {
        return __awaiter(this, void 0, void 0, function () {
            var currentDate, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        currentDate = new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        });
                        return [4 /*yield*/, this.client.files.uploadV2({
                                channel_id: this.channel,
                                initial_comment: currentDate,
                                file_uploads: file_uploads,
                            })];
                    case 1:
                        _a.sent();
                        console.log("Uploaded files to Slack");
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        if (error_2.code === 'slack_error_code') {
                            console.error("Error uploading files to Slack: ".concat(error_2.message));
                        }
                        else {
                            console.error("Unexpected error: ".concat(error_2));
                        }
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return SlackBot;
}());
exports.default = SlackBot;
