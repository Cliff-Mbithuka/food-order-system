import { Request, Response, NextFunction } from "express";

import { plainToClass } from "class-transformer";
import { CreateCustomerInputs, UserLoginInputs, EditCustomerProfileInputs } from "../dto/Customer.dto";
import { validate, ValidationError } from "class-validator";
import { GenerateOtp, GeneratePassword,GenerateSignature, GenerateSalt, onRequestOTP, ValidatePassword } from "../utility";
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
            _id: String(result._id),
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
) => {

  const loginInputs = plainToClass(UserLoginInputs, req.body);

  const loginErrors = await validate(loginInputs, {validationError: { target: false}});

  if(loginErrors.length > 0){
    return res.status(400).json(loginErrors)
  }

  const { email, password} = loginInputs

  const customer = await Customer.findOne({ email: email});

  if(customer){

    const validation = await ValidatePassword(password, customer.password, customer.salt)

    if(validation){

      //generate the signature 
      const signature = GenerateSignature({
        _id: String(customer._id),
        email: customer.email,
        verified: customer.verified
      })

      // send the result to client 
      return res.status(201).json({ signature: signature, verified: customer.verified, email: customer.email})
    } 
  }

  return res.status(404).json({message: ' LoginError'});
};

// verify customer account
// export const CustomerVerify = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {

//   const {otp} = req.body; 
//   const customer = req.user;

//   if(customer){
//     const profile = await Customer.findById(customer._id)

//     if(profile){
//       if(profile.otp === parseInt(otp) && profile.otp_expiry >= new Date() ){
//         profile.verified = true;

//         const updatedCustomerResponse = await profile.save();

//         // Generate the signature
//         const signature = GenerateSignature({
//           _id: String(updatedCustomerResponse._id),
//           email: updatedCustomerResponse.email,
//           verified: updatedCustomerResponse.verified
//         });

//         return res.status(201).json({
//           signature: signature,
//           verified: updatedCustomerResponse.verified,
//           email: updatedCustomerResponse.email
//         })
//       }
//     }
//   }

//   return res.status(400).json({message : 'Error with OTP validation'})
// };

// Otp / requesting OTP
// export const RequestOtp = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {

//   const customer = req.user;

//   if(customer){
//     const profile = await Customer.findById(customer._id);

//     if(profile){

//       const {otp, expiry} = GenerateOtp();

//       profile.otp = otp;
//       profile.otp_expiry = expiry;

//       await profile.save();
//       await onRequestOTP(otp, profile.phone);

//       res.status(200).json({ message: 'OTP sent your registered phone number'})
//     }
//   }

//   return res.status(400).json({message: 'Error with Request OTP'})
// };

// Get customer profile
export const GetCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  


  if(customer){
    const profile = await Customer.findById(customer._id)

    if(profile){

     

     return res.status(200).json(profile)
    }
  }

  return res.status(400).json({message: 'Error with fetching profile'})
};

// Update customer profile
export const EditCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  const profileInputs = plainToClass( EditCustomerProfileInputs, req.body);

  const profileErrors = await validate(profileInputs, {validationError: { target: false}})

  if(profileErrors.length > 0){
    return res.status(400).json(profileErrors)
  }

  const { firstName, lastName, address} = profileInputs

  if(customer){
    const profile = await Customer.findById(customer._id)

    if(profile){

      profile.firstName = firstName;
      profile.lastName = lastName;
      profile.address = address;

      const result = await profile.save();

      res.status(200).json(result)
    }
  }
};
