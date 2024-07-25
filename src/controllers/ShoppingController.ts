import express, { Request, Response, NextFunction } from "express";
import { Vandor, FoodDoc } from "../models";
import { Offer } from "../models";

// Get food Availability
export const GetFoodAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;

  console.log(pincode);

  const result = await Vandor.find({
    pinCode: pincode,
    serviceAvailable: false,
  })
    .sort([["rating", "descending"]])
    .populate("foods");

  if (result.length > 0) {
    return res.status(200).json(result);
  }
  console.log(result);

  return res.status(400).json({ msg: "data Not found!" });
};

// Get top resturants
export const GetTopRestaurants = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;

  const result = await Vandor.find({
    pinCode: pincode,
    serviceAvailable: false,
  })
    .sort([["rating", "descending"]])
    .limit(1);

  if (result.length > 0) {
    return res.status(200).json(result);
  }

  return res.status(404).json({ msg: "data Not found!" });
};

// food in 30 min
export const GetFoodIn30Min = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;

  const result = await Vandor.find({
    pinCode: pincode,
    serviceAvailable: false,
  })
    .sort([["rating", "descending"]])
    .populate("foods");

  if (result.length > 0) {
    let foodResult: any = [];

    result.map((vandor) => {
      const foods = vandor.foods as [FoodDoc];

      foodResult.push(...foods.filter((food) => Number(food.readyTime) <= 30));
    });

    return res.status(200).json(foodResult);
  }
  return res.status(404).json({ msg: "data Not found!" });
};

// search foods
export const SearchFoods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;

  const result = await Vandor.find({
    pinCode: pincode,
    serviceAvailable: false,
  }).populate("foods");

  if (result.length > 0) {
    let foodResult: any = [];

    result.map((item) => foodResult.push(...item.foods));

    return res.status(200).json(foodResult);
  }

  return res.status(404).json({ msg: "data Not found!" });
};

export const ResturantById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  
  const result = await Vandor.findById(id).populate("foods");

  if (result) {
    return res.status(200).json(result);
  }

  return res.status(404).json({ msg: "data Not found!" });
};

//Get available offer
export const GetAvailableOffers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;

  const offers = await Offer.find({ pincode: pincode, isActive: true });

  if (offers) {
    return res.status(200).json(offers);
  }

  return res.json({ message: "Offers not Found!" });
};
