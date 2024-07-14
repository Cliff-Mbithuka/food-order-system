import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { APP_SECRET } from '../config';
import { VandorPayLoad } from '../dto/Vandor.dto';
import { AuthPayload } from '../dto/Auth.dot';


export const GenerateSalt = async  () => {
    return await bcrypt.genSalt();
}

export const GeneratePassword = async (password:string, salt:string) => {
    return await bcrypt.hash(password, salt);
}

export const ValidatePassword = async (enteredPassword: string,savedPassword: string, salt: string) => {
    return await GeneratePassword(enteredPassword, salt) === savedPassword;
}

export const GenerateSignature = (payload: VandorPayLoad) => {
 return jwt.sign(payload,APP_SECRET, {expiresIn: "4d" })
}


export const ValidateSignature = async (req: Request) => {
 const signature = req.get('Authorization');

 if(signature){
     
    const payLoad = await jwt.verify(signature.split(' ')[1], APP_SECRET) as AuthPayload;

    req.user = payLoad;

    return true;
 }
 
 
    return false;
}