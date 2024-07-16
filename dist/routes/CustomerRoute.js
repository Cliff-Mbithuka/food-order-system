"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerRoute = void 0;
var express_1 = __importDefault(require("express"));
var CustomerController_1 = require("../controllers/CustomerController");
var middlewares_1 = require("../middlewares");
var router = express_1.default.Router();
exports.CustomerRoute = router;
/*--------------- Signup / Create Customer ------------ */
router.post('/signup', CustomerController_1.CustomerSignUp);
/*--------------- Login  ------------ */
router.post('/login', CustomerController_1.CustomerLogin);
//Authentication
router.use(middlewares_1.Authenticate);
/*--------------- Verify Customer  Account------------ */
router.patch('/verify', CustomerController_1.CustomerVerify);
/*--------------- OTP / Requesting OTP ------------ */
router.get('/otp', CustomerController_1.RequestOtp);
/*--------------- Profile ------------ */
router.get('/profile', CustomerController_1.GetCustomerProfile);
/*---------------update Profile ------------ */
router.patch('/profile', CustomerController_1.EditCustomerProfile);
//# sourceMappingURL=CustomerRoute.js.map