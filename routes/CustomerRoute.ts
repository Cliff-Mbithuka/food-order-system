import express, {Request, Response, NextFunction } from 'express';
import { CustomerLogin, CustomerSignUp, CustomerVerify, EditCustomerProfile, GetCustomerProfile, RequestOtp } from '../controllers/CustomerController';

const router = express.Router();
 
/*--------------- Signup / Create Customer ------------ */
router.post('/signup', CustomerSignUp);

/*--------------- Login  ------------ */
router.post('/login', CustomerLogin);

//Authentication

/*--------------- Verify Customer  Account------------ */
router.patch('/verify', CustomerVerify);

/*--------------- OTP / Requesting OTP ------------ */
router.get('/otp', RequestOtp);


/*--------------- Profile ------------ */
router.get('/profile', GetCustomerProfile);


/*---------------update Profile ------------ */
router.patch('/profile',EditCustomerProfile );

// cart
// Order

//payment 

export { router as CustomerRoute };