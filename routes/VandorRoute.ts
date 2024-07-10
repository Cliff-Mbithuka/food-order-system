import express, { Request, Response, NextFunction} from 'express';
import { AddFood, GetFoods, GetVandorProfile, updateVandorProfile, updateVandorService, VandorLogin } from '../controllers/VandorContoller';
import { Authenticate } from '../middlewares';
import multer from 'multer';

const router = express.Router();

// configure multer
const imageStorage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "images")
    },
    filename: function(req, file, cb){
        cb(null, new Date().toISOString()+'_'+file.originalname)
    }
})

const images = multer({storage: imageStorage}).array('images', 10)

router.post('/login', VandorLogin);


router.use(Authenticate);
router.get('/profile', GetVandorProfile);
router.patch('/profile', updateVandorProfile);
router.patch('/service', updateVandorService);

router.post("/food",images, AddFood);
router.get("/foods", GetFoods);

router.get('/', (req: Request, res: Response, next: NextFunction) => {


    res.json({ messsage: "Hello from Vandor"});
});

export { router as VandorRoute};