import express, { Request, Response, NextFunction } from "express";
import { Vandor, FoodDoc } from "../models";

export const GetFoodAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;

  const result = await Vandor.find({
    pincode: pincode,
    serviceAvailable: false,
  })
    .sort([["rating", "descending"]])
    .populate("foods");

  if (result.length > 0) {
    return res.status(200).json(result);
  }

  return res.status(404).json({ msg: "data Not found!" });
};

export const GetTopRestaurants = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;

  const result = await Vandor.find({
    pincode: pincode,
    serviceAvailable: false,
  })
    .sort([["rating", "descending"]])
    .limit(7);

  if (result.length > 0) {
    return res.status(200).json(result);
  }

  return res.status(404).json({ msg: "data Not found!" });
};

export const GetFoodIn30Min = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;

  const result = await Vandor.find({
    pincode: pincode,
    serviceAvailable: false,
  })
    .sort([["rating", "descending"]])
    .populate("foods");

  if (result.length > 0) {
    let foodResult: any = [];
    result.map((vandor) => {
      const foods = vandor.foods as [FoodDoc];
      foodResult.push(...foods.filter((food) => food.readyTime <= 30));
    });
    return res.status(200).json(foodResult);
  }

  return res.status(404).json({ msg: "data Not found!" });
};

export const SearchFoods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

export const ResturantById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
