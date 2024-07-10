import { Request, Response, NextFunction } from "express";
import { CreateVandorInput } from "../dto";
import { Vandor } from "../models";
import { GeneratePassword, GenerateSalt } from "../utility";

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

  const existingVandor = await Vandor.findOne({ email : email});

  if(existingVandor !== null){
    return res.json({
      "message": "A vandor is existing with this email ID"
    })
  }

  //Generate a salt
  const salt = await GenerateSalt();
  const userPassword = await GeneratePassword(password, salt);

  //encrypt the password usiing the salt


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
  });

  return res.json({ createdVandor });
};

export const GetVandors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
export const GetVandorById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
