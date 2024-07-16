"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VandorRoute = void 0;
var express_1 = __importDefault(require("express"));
var VandorContoller_1 = require("../controllers/VandorContoller");
var middlewares_1 = require("../middlewares");
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var multer_1 = __importDefault(require("multer"));
var router = express_1.default.Router();
exports.VandorRoute = router;
// configure multer
var imageStorage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        var imagesDir = path_1.default.join(__dirname, '..', 'images');
        if (!fs_1.default.existsSync(imagesDir)) {
            fs_1.default.mkdirSync(imagesDir, { recursive: true });
        }
        cb(null, imagesDir);
    },
    filename: function (req, file, cb) {
        var timestamp = new Date().toISOString().replace(/:/g, '-');
        cb(null, "".concat(timestamp, "_").concat(file.originalname));
    }
});
var images = (0, multer_1.default)({ storage: imageStorage }).array('images', 10);
router.post('/login', VandorContoller_1.VandorLogin);
router.use(middlewares_1.Authenticate);
router.get('/profile', VandorContoller_1.GetVandorProfile);
router.patch('/profile', VandorContoller_1.updateVandorProfile);
router.patch('/coverimage', images, VandorContoller_1.UpdateVandorCoverImage);
router.patch('/service', VandorContoller_1.updateVandorService);
router.post("/food", images, VandorContoller_1.AddFood);
router.get("/foods", VandorContoller_1.GetFoods);
router.get('/', function (req, res, next) {
    res.json({ messsage: "Hello from Vandor" });
});
//# sourceMappingURL=VandorRoute.js.map