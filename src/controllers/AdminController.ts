import { Request, Response, NextFunction } from "express";
import { CreateVandorInput } from "../dto";
import { Vandor, Transaction } from "../models";
import { GeneratePassword, GenerateSalt } from "../utility";


//find vandor by ID or EMAIL
export const FindVandor = async(id:string | undefined, email?: string) => {

  if(email){
    return await Vandor.findOne({email: email});
    
  }else{
    return await Vandor.findById(id);
   
  };

}

// Create a vandor
export const CreateVandor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    name,
    address,
    pinCode,
    foodType,
    email,
    password,
    ownerName,
    phone,
  } = <CreateVandorInput>req.body;

  const existingVandor = await FindVandor('', email);

  if(existingVandor !== null){
    return res.json({
      "message": "A vandor is existing with this email ID"
    })
  }

  //Generate a salt
  const salt = await GenerateSalt();

  //encrypt the password usiing the salt
  const userPassword = await GeneratePassword(password, salt);


  const createdVandor = await Vandor.create({
    name: name,
    address: address,
    pinCode: pinCode,
    foodType: foodType,
    email: email,
    password: userPassword,
    salt: salt,
    ownerName: ownerName,
    phone: phone,
    rating: 0,
    serviceAvailable: false,
    coverImages: [],
    foods: []
  });

  return res.json({ createdVandor });
};

// Get all vandors from the DB
export const GetVandors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => { 
  const vandors = await Vandor.find()

  if(vandors !== null){
    return res.json(vandors)
  }

  return res.json({"message": "Vandors data not available"});
};

// Get vandor with the ID
export const GetVandorById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const vandorId = req.params.id;

  const vandor = await FindVandor(vandorId);

  if(vandor !== null){
    return res.json(vandor);
  }

  return res.json({"message": "Vandor data not available"});
};


export const GetTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const transactions = await Transaction.find();

  if(transactions){
    return res.status(200).json(transactions)
  }

  return res.json({"message": "Transaction not available"});
};


export const GetTransactionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;

  const transactions = await Transaction.findById(id)

  if(transactions){
    return res.status(200).json(transactions)
  }

  return res.json({"message": "Transaction not available"});
};
