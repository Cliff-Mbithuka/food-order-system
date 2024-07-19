import express, { Request, Response, NextFunction} from 'express';
import { CreateVandor, GetTransactions, GetTransactionById, VerifyDeliveryUser, GetDeliveryUsers, GetVandorById, GetVandors, } from '../controllers';



const router = express.Router();

router.post('/vandor', CreateVandor);
router.get('/vandors', GetVandors);
router.get('/vandor/:id', GetVandorById);

router.get('/transactions', GetTransactions);
router.get('/vandor/:id', GetTransactionById);

router.put('/delivery/verify', VerifyDeliveryUser)
router.get('/delivery/users', GetDeliveryUsers);

router.get('/', (req: Request, res: Response, next: NextFunction) => {


    res.json({ messsage: "Hello from Admin"});
});

export { router as AdminRoute}