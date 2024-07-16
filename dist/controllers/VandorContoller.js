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
exports.GetFoods = exports.AddFood = exports.updateVandorService = exports.UpdateVandorCoverImage = exports.updateVandorProfile = exports.GetVandorProfile = exports.VandorLogin = void 0;
var AdminController_1 = require("./AdminController");
var utility_1 = require("../utility");
var Food_1 = require("../models/Food");
var VandorLogin = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, existingVandor, Validation, signature;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, email = _a.email, password = _a.password;
                return [4 /*yield*/, (0, AdminController_1.FindVandor)("", email)];
            case 1:
                existingVandor = _b.sent();
                if (!(existingVandor !== null)) return [3 /*break*/, 3];
                return [4 /*yield*/, (0, utility_1.ValidatePassword)(password, existingVandor.password, existingVandor.salt)];
            case 2:
                Validation = _b.sent();
                if (Validation) {
                    signature = (0, utility_1.GenerateSignature)({
                        _id: existingVandor.id,
                        email: existingVandor.email,
                        foodTypes: existingVandor.foodType,
                        name: existingVandor.name,
                    });
                    return [2 /*return*/, res.json(signature)];
                }
                else {
                    return [2 /*return*/, res.json({ message: "password is not valid" })];
                }
                _b.label = 3;
            case 3: return [2 /*return*/, res.json({ Message: "Login credential not valid" })];
        }
    });
}); };
exports.VandorLogin = VandorLogin;
// Get Vandor profile
var GetVandorProfile = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var user, existingVandor;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                user = req.user;
                if (!user) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, AdminController_1.FindVandor)(user._id)];
            case 1:
                existingVandor = _a.sent();
                return [2 /*return*/, res.json(existingVandor)];
            case 2: return [2 /*return*/, res.json({ message: "Vandor information Not found" })];
        }
    });
}); };
exports.GetVandorProfile = GetVandorProfile;
// Update Vandor profile
var updateVandorProfile = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, foodTypes, name, address, phone, user, existingVandor, savedResult;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, foodTypes = _a.foodTypes, name = _a.name, address = _a.address, phone = _a.phone;
                user = req.user;
                if (!user) return [3 /*break*/, 4];
                return [4 /*yield*/, (0, AdminController_1.FindVandor)(user._id)];
            case 1:
                existingVandor = _b.sent();
                if (!(existingVandor !== null)) return [3 /*break*/, 3];
                existingVandor.name = name;
                existingVandor.address = address;
                existingVandor.phone = phone;
                existingVandor.foodType = foodTypes;
                return [4 /*yield*/, existingVandor.save()];
            case 2:
                savedResult = _b.sent();
                return [2 /*return*/, res.json(savedResult)];
            case 3: return [2 /*return*/, res.json(existingVandor)];
            case 4: return [2 /*return*/, res.json({ message: "Vandor information Not found" })];
        }
    });
}); };
exports.updateVandorProfile = updateVandorProfile;
// update vandor cover image
var UpdateVandorCoverImage = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var user, vandor, files, images, result;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                user = req.user;
                if (!user) return [3 /*break*/, 3];
                return [4 /*yield*/, (0, AdminController_1.FindVandor)(user._id)];
            case 1:
                vandor = _b.sent();
                if (!(vandor !== null)) return [3 /*break*/, 3];
                files = req.files;
                images = files.map(function (file) { return file.filename; });
                (_a = vandor.coverImages).push.apply(_a, images);
                return [4 /*yield*/, vandor.save()];
            case 2:
                result = _b.sent();
                return [2 /*return*/, res.json(result)];
            case 3: return [2 /*return*/, res.json({ message: "Something went wrong with add food" })];
        }
    });
}); };
exports.UpdateVandorCoverImage = UpdateVandorCoverImage;
//update vandor service
var updateVandorService = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var user, existingVandor, savedResult;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                user = req.user;
                if (!user) return [3 /*break*/, 4];
                return [4 /*yield*/, (0, AdminController_1.FindVandor)(user._id)];
            case 1:
                existingVandor = _a.sent();
                if (!(existingVandor !== null)) return [3 /*break*/, 3];
                existingVandor.serviceAvailable = !existingVandor.serviceAvailable;
                return [4 /*yield*/, existingVandor.serviceAvailable];
            case 2:
                savedResult = _a.sent();
                return [2 /*return*/, res.json(savedResult)];
            case 3: return [2 /*return*/, res.json(existingVandor)];
            case 4: return [2 /*return*/, res.json({ message: "Vandor information Not found" })];
        }
    });
}); };
exports.updateVandorService = updateVandorService;
// add food
var AddFood = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var user, _a, name_1, description, category, foodType, readyTime, price, vandor, files, images, createdFood, result;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                user = req.user;
                if (!user) return [3 /*break*/, 4];
                _a = req.body, name_1 = _a.name, description = _a.description, category = _a.category, foodType = _a.foodType, readyTime = _a.readyTime, price = _a.price;
                return [4 /*yield*/, (0, AdminController_1.FindVandor)(user._id)];
            case 1:
                vandor = _b.sent();
                if (!(vandor !== null)) return [3 /*break*/, 4];
                files = req.files;
                images = files.map(function (file) { return file.filename; });
                return [4 /*yield*/, Food_1.Food.create({
                        vandorId: vandor._id,
                        name: name_1,
                        description: description,
                        category: category,
                        foodType: foodType,
                        images: images,
                        readyTime: readyTime,
                        price: price,
                        rating: 0
                    })];
            case 2:
                createdFood = _b.sent();
                vandor.foods.push(createdFood);
                return [4 /*yield*/, vandor.save()];
            case 3:
                result = _b.sent();
                return [2 /*return*/, res.json(result)];
            case 4: return [2 /*return*/, res.json({ message: "Something went wrong with add food" })];
        }
    });
}); };
exports.AddFood = AddFood;
//Get foods
var GetFoods = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var user, foods;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                user = req.user;
                if (!user) return [3 /*break*/, 2];
                return [4 /*yield*/, Food_1.Food.find({ vandorId: user._id })];
            case 1:
                foods = _a.sent();
                if (foods !== null) {
                    return [2 /*return*/, res.json(foods)];
                }
                _a.label = 2;
            case 2: return [2 /*return*/, res.json({ message: "foods information Not found" })];
        }
    });
}); };
exports.GetFoods = GetFoods;
//# sourceMappingURL=VandorContoller.js.map