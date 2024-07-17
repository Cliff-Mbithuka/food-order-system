import { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import {
  CreateCustomerInputs,
  UserLoginInputs,
  EditCustomerProfileInputs,
  OrderInputs,
} from "../dto/Customer.dto";
import { validate, ValidationError } from "class-validator";
import {
  GenerateOtp,
  GeneratePassword,
  GenerateSignature,
  GenerateSalt,
  onRequestOTP,
  ValidatePassword,
} from "../utility";
import { Customer } from "../models/Customer";
import { verify } from "jsonwebtoken";
import { Order } from "../models/Order";
import { Food } from "../models/Food";

// Sign up /  create customer
export const CustomerSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customerInputs = plainToClass(CreateCustomerInputs, req.body);

  const inputErrors = await validate(customerInputs, {
    validationError: { target: true },
  });

  if (inputErrors.length > 0) {
    return res.status(400).json(inputErrors);
  }

  const { email, phone, password } = customerInputs;

  const salt = await GenerateSalt();
  const userPassword = await GeneratePassword(password, salt);

  const { otp, expiry } = GenerateOtp();

  const existingCustomer = await Customer.findOne({ email: email });

  if (existingCustomer !== null) {
    return res
      .status(409)
      .json({ message: "A user exists with the provided email" });
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
    address: "",
    verified: false,
    lat: 0,
    lng: 0,
    orders: [],
  });

  if (result) {
    // send the OTP to customer
    await onRequestOTP(otp, phone);

    // Generate the signature
    const signature = GenerateSignature({
      _id: String(result._id),
      email: result.email,
      verified: result.verified,
    });

    // Send the result to client
    return res
      .status(201)
      .json({
        signature: signature,
        verified: result.verified,
        email: result.email,
      });
  }

  return res.status(400).json({ message: "Error with Signup" });
};

// login customer
export const CustomerLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const loginInputs = plainToClass(UserLoginInputs, req.body);

  const loginErrors = await validate(loginInputs, {
    validationError: { target: false },
  });

  if (loginErrors.length > 0) {
    return res.status(400).json(loginErrors);
  }

  const { email, password } = loginInputs;

  const customer = await Customer.findOne({ email: email });

  if (customer) {
    const validation = await ValidatePassword(
      password,
      customer.password,
      customer.salt
    );

    if (validation) {
      // generate the signature
      const signature = GenerateSignature({
        _id: String(customer._id),
        email: customer.email,
        verified: customer.verified,
      });

      // send the result to client
      return res
        .status(201)
        .json({
          signature: signature,
          verified: customer.verified,
          email: customer.email,
        });
    }
  }

  return res.status(404).json({ message: "LoginError" });
};

// verify customer account
export const CustomerVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { otp } = req.body;
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id);
    if (profile) {
      const otpExpiry = new Date(profile.otp_expiry).getTime();
      if (profile.otp === otp && otpExpiry >= Date.now()) {
        profile.verified = true;

        const updatedCustomerResponse = await profile.save();

        const signature = GenerateSignature({
          _id: String(updatedCustomerResponse._id),
          email: updatedCustomerResponse.email,
          verified: updatedCustomerResponse.verified,
        });

        return res.status(200).json({
          signature,
          email: updatedCustomerResponse.email,
          verified: updatedCustomerResponse.verified,
        });
      }
    }
  }

  return res.status(400).json({ msg: "Unable to verify Customer" });
};

//Otp / requesting OTP
export const RequestOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id);

    if (profile) {
      const { otp, expiry } = GenerateOtp();

      profile.otp = otp;
      profile.otp_expiry = expiry;

      await profile.save();
      await onRequestOTP(otp, profile.phone);

      res
        .status(200)
        .json({ message: "OTP sent to your registered phone number" });
    }
  }

  return res.status(400).json({ message: "Error with Request OTP" });
};

// Get customer profile
export const GetCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id);

    if (profile) {
      return res.status(200).json(profile);
    }
  }

  return res.status(400).json({ message: "Error with fetching profile" });
};

// Update customer profile
export const EditCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  const profileInputs = plainToClass(EditCustomerProfileInputs, req.body);

  const profileErrors = await validate(profileInputs, {
    validationError: { target: false },
  });

  if (profileErrors.length > 0) {
    return res.status(400).json(profileErrors);
  }

  const { firstName, lastName, address } = profileInputs;

  if (customer) {
    const profile = await Customer.findById(customer._id);

    if (profile) {
      profile.firstName = firstName;
      profile.lastName = lastName;
      profile.address = address;

      const result = await profile.save();

      res.status(200).json(result);
    }
  }
};

/**=========Cart section========= */
//Add to cart
export const AddToCart = async (req: Request, res: Response, next: NextFunction) => {

  const customer = req.user;
  
  if(customer){

      const profile = await Customer.findById(customer._id);
      let cartItems = Array();

      const { _id, unit } = <OrderInputs>req.body;

      const food = await Food.findById(_id);

      if(food){

          if(profile != null){
            //check for cart items
              cartItems = profile.cart;

              if(cartItems.length > 0){
                  // check and update unit
                  let existFoodItems = cartItems.filter((item) => item.food._id.toString() === _id);
                  if(existFoodItems.length > 0){
                      
                      const index = cartItems.indexOf(existFoodItems[0]);
                      
                      if(unit > 0){
                          cartItems[index] = { food, unit };
                      }else{
                          cartItems.splice(index, 1);
                      }

                  }else{
                      cartItems.push({ food, unit})
                  }

              }else{
                  // add new Item to cart
                  cartItems.push({ food, unit });
              }

              if(cartItems){
                  profile.cart = cartItems as any;
                  const cartResult = await profile.save();
                  return res.status(200).json(cartResult.cart);
              }

          }
      }

  }

  return res.status(404).json({ msg: 'Unable to add to cart!'});
}

//Get items from the cart
export const GetCart = async (req: Request, res: Response, next: NextFunction) => {

    
  const customer = req.user;
  
  if(customer){
      const profile = await Customer.findById(customer._id);

      if(profile){
          return res.status(200).json(profile.cart);
      }
  
  }

  return res.status(400).json({message: 'Cart is Empty!'})

}
//Delete items in the cart
export const DeleteCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

/**=========Order section========= */
//Create orders
export const CreateOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Grab current login customer
  const customer = req.user;

  if (customer) {
    // create an order ID
    const orderId = `${Math.floor(Math.random() * 89999) + 1000}`;

    const profile = await Customer.findById(customer._id);

    // Grab order items from request [{ id: XX ,  unit: XX}]
    const cart = <[OrderInputs]>req.body;

    let cartItems = Array();

    let netAmount = 0.0;

    //Calculate order amount
    const foods = await Food.find()
      .where("_id")
      .in(cart.map((item) => item._id))
      .exec();

    foods.map((food) => {
      cart.map(({ _id, unit }) => {
        if (food._id == _id) {
          // vandorId = food.vandorId;
          netAmount += food.price * unit;
          cartItems.push({ food, unit });
        }
      });
    });

    //create order with item descriptions
    if (cartItems) {
      // Create order
      const currentOrder = await Order.create({
        orderID: orderId,
        items: cartItems,
        totalAmount: netAmount,
        orderDate: new Date(),
        paidThrough: "COD",
        paymentResponse: "",
        orderStatus: "Waiting",
      });

      if (currentOrder) {
        profile.orders.push(currentOrder);
        await profile.save();

        return res.status(200).json(currentOrder);
      }
    }
  }
  return res.status(400).json({ msg: "Error while Creating Order" });
};

export const GetOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id).populate("orders");

    if (profile) {
      return res.status(200).json(profile.orders);
    }
  }
};

export const GetOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const orderId = req.params.id;

  if (orderId) {
    const order = (await Order.findById(orderId)).populate("items.food");

    res.status(200).json(order);
  }
};
