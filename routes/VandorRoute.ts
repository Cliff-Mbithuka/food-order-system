import express, { Request, Response, NextFunction} from 'express';
import { GetVandorProfile, updateVandorProfile, updateVandorService, VandorLogin } from '../controllers/VandorContoller';
import { Authenticate } from '../middlewares';

const router = express.Router();

router.post('/login', VandorLogin);

router.use(Authenticate);
router.get('/profile', GetVandorProfile);
router.patch('/profile', updateVandorProfile);
router.patch('/service', updateVandorService);

router.get('/', (req: Request, res: Response, next: NextFunction) => {


    res.json({ messsage: "Hello from Vandor"});
});

export { router as VandorRoute};