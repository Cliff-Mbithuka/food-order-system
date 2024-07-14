import { Request, Response, NextFunction } from "express";

import { plainToClass } from "class-transformer";
import { CreateCustomerInputs } from "../dto/Customer.dto";
import { validate, ValidationError } from "class-validator";
import { GenerateOtp, GeneratePassword,GenerateSignature, GenerateSalt, onRequestOTP } from "../utility";
import { Customer } from "../models/Customer";
import { verify } from "jsonwebtoken";



// Sign up /  create customer
export const CustomerSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

    const customerInputs = plainToClass(CreateCustomerInputs, req.body);

    const inputErrors = await validate(customerInputs, { validationError: { target: true}});

    if(inputErrors.length > 0){
        return res.status(400).json(inputErrors)
    }

    const { email, phone, password } = customerInputs;

    const salt = await GenerateSalt();
    const userPassword = await GeneratePassword(password, salt);

    const { otp, expiry} = GenerateOtp();
    
    const existingCustomer = await Customer.findOne({email: email})

    if(existingCustomer !== null){
      return res.status(409).json({message: 'An user exist with the provided email'});
    }
    

    const result = await Customer.create({
        email: email,
        password: userPassword,
        salt: salt,
        phone: phone,
        otp: otp,
        otp_expiry: expiry,
        firstName: "",
        lastName: "",
        address: '',
        verified: false,
        lat: 0,
        lng: 0
    })

    if(result){

        // send the OTP to customer
        await onRequestOTP(otp, phone)

        // Generate the signature
        const signature = GenerateSignature({
            _id: result._id,
            email: result.email,
            verified: result.verified
        })

        // Send the result to client
        return res.status(201).json({ signature: signature, verified: result.verified, email: result.email})  
    }

    return res.status(400).json({message: 'Error with Signup'})
};


// login customer
export const CustomerLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

// verify customer account
export const CustomerVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

// Otp / requesting OTP
export const RequestOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

// Get customer profile
export const GetCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

// Update customer profile
export const EditCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
