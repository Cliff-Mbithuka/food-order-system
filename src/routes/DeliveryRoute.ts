import express, { Request, Response, NextFunction } from "express";

import { Authenticate } from "../middlewares";
import { DeliveryLogin, DeliverySignUp, EditDeliveryProfile, GetDeliveryProfile } from "../controllers/DeliveryController";


const router = express.Router();

/*--------------- Signup / Create Customer ------------ */
router.post("/signup", DeliverySignUp);

/*--------------- Login  ------------ */
router.post("/login", DeliveryLogin);

//Authentication
router.use(Authenticate);

/*--------------- Change Service Status ------------ */
router.put('/change-status', );

/*--------------- Profile ------------ */
router.get("/profile", GetDeliveryProfile);

/*---------------update Profile ------------ */
router.patch("/profile", EditDeliveryProfile);



export { router as DeliveryRoute };
