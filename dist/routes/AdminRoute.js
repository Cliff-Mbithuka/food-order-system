"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRoute = void 0;
var express_1 = __importDefault(require("express"));
var controllers_1 = require("../controllers");
var router = express_1.default.Router();
exports.AdminRoute = router;
router.post('/vandor', controllers_1.CreateVandor);
router.get('/vandors', controllers_1.GetVandors);
router.get('/vandor/:id', controllers_1.GetVandorById);
router.get('/', function (req, res, next) {
    res.json({ messsage: "Hello from Admin" });
});
//# sourceMappingURL=AdminRoute.js.map