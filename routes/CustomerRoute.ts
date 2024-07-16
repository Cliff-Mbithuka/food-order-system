import express, {Request, Response, NextFunction } from 'express';
import { CustomerLogin, CustomerSignUp, EditCustomerProfile, GetCustomerProfile } from '../controllers/CustomerController';
import { Authenticate } from '../middlewares';

const router = express.Router();
 
/*--------------- Signup / Create Customer ------------ */
router.post('/signup', CustomerSignUp);

/*--------------- Login  ------------ */
router.post('/login', CustomerLogin);

//Authentication
router.use(Authenticate)

/*--------------- Verify Customer  Account------------ */
// router.patch('/verify', );

/*--------------- OTP / Requesting OTP ------------ */
// router.get('/otp', );


/*--------------- Profile ------------ */
router.get('/profile', GetCustomerProfile);


/*---------------update Profile ------------ */
router.patch('/profile',EditCustomerProfile );

// cart
// Order

//payment 

export { router as CustomerRoute };