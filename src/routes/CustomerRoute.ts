import express, { Request, Response, NextFunction } from "express";
import {
  CustomerLogin,
  CustomerSignUp,
  EditCustomerProfile,
  GetCustomerProfile,
  CustomerVerify,
  RequestOtp,
  CreateOrder,
  GetOrders,
  GetOrderById,
  AddToCart,
  DeleteCart,
  GetCart,
  VerifyOffer
  ,CreatePayment
} from "../controllers/CustomerController";
import { Authenticate } from "../middlewares";

const router = express.Router();

/*--------------- Signup / Create Customer ------------ */
router.post("/signup", CustomerSignUp);

/*--------------- Login  ------------ */
router.post("/login", CustomerLogin);

//Authentication
router.use(Authenticate);

/*--------------- Verify Customer  Account------------ */
router.patch("/verify", CustomerVerify);

/*--------------- OTP / Requesting OTP ------------ */
router.get("/otp", RequestOtp);

/*--------------- Profile ------------ */
router.get("/profile", GetCustomerProfile);

/*---------------update Profile ------------ */
router.patch("/profile", EditCustomerProfile);

// cart
router.post("/cart", AddToCart);
router.get("/cart", GetCart);
router.delete("/cart", DeleteCart);

//Apply offers
router.get('/offer/verify/:id', VerifyOffer)

//payment
router.post('/create-payment', CreatePayment)


// Order
router.post("/create-order", CreateOrder);
router.get("/orders", GetOrders);
router.get("/order/:id", GetOrderById);

export { router as CustomerRoute };
