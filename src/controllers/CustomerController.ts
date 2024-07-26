import { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import {
  CreateCustomerInputs,
  UserLoginInputs,
  EditCustomerProfileInputs,
  OrderInputs,
  CartItem,
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
import { DeliveryUser, Offer, Transaction, Vandor } from "../models";

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

  console.log(otp, expiry);
  

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
    return res.status(201).json({
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
      return res.status(201).json({
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
export const AddToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id);
    let cartItems = Array();

    const { _id, unit } = <CartItem>req.body;

    const food = await Food.findById(_id);

    if (food) {
      if (profile != null) {
        //check for cart items
        cartItems = profile.cart;

        if (cartItems.length > 0) {
          // check and update unit
          let existFoodItems = cartItems.filter(
            (item) => item.food._id.toString() === _id
          );
          if (existFoodItems.length > 0) {
            const index = cartItems.indexOf(existFoodItems[0]);

            if (unit > 0) {
              cartItems[index] = { food, unit };
            } else {
              cartItems.splice(index, 1);
            }
          } else {
            cartItems.push({ food, unit });
          }
        } else {
          // add new Item to cart
          cartItems.push({ food, unit });
        }

        if (cartItems) {
          profile.cart = cartItems as any;
          const cartResult = await profile.save();
          return res.status(200).json(cartResult.cart);
        }
      }
    }
  }

  return res.status(404).json({ msg: "Unable to add to cart!" });
};

//Get items from the cart
export const GetCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id);

    if (profile) {
      return res.status(200).json(profile.cart);
    }
  }

  return res.status(400).json({ message: "Cart is Empty!" });
};
//Delete items in the cart
export const DeleteCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id)
      .populate("cart.food")
      .exec();

    if (profile != null) {
      profile.cart = [] as any;
      const cartResult = await profile.save();

      return res.status(200).json(cartResult);
    }
  }

  return res.status(400).json({ message: "cart is Already Empty!" });
};

//============= Create payment ========//
export const CreatePayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  const { amount, paymentMode, offerId } = req.body;

  let payableAmount = Number(amount);

  if (offerId) {
    const appliedOffer = await Offer.findById(offerId);

    if (appliedOffer) {
      if (appliedOffer.isActive) {
        payableAmount = payableAmount - appliedOffer.offerAmount;
      }
    }
  }

  // Perform Payment gateway charge API call

  // Right after payment gateway success / failure response

  // Create record on Transacion
  const transaction = await Transaction.create({
    customer: customer._id,
    vandorId: "",
    orderId: "",
    orderValue: payableAmount,
    offerUsed: offerId || "NA",
    status: "OPEN",
    paymentMode: paymentMode,
    paymentResponse: "Payment is Cash on Delivery",
  });

  // return transaction ID
  return res.status(200).json(transaction);
};

/**=========Delivery Notifications========= */
const assignOrderForDelivery = async (orderId: string, vandorId: string) => {
  // Find the vandor
  const vandor = await Vandor.findById(vandorId);

  if (vandor) {
    const areaCode = vandor.pinCode;
    const vandorLat = vandor.lat;
    const vandorLng = vandor.lng;

    // Find the Available Delivery person
    const deliveryPerson = await DeliveryUser.find({
      pincode: areaCode,
      verified: true,
      isAvailable: true,
    });

    if (deliveryPerson) {
      // Check the nearest delivery person and assign the order

      const currentOrder = await Order.findById(orderId);

      if (currentOrder) {
        // update deliveryId
         currentOrder.deliveryId = String(deliveryPerson[0]._id);
       const response = await currentOrder.save();

        // Notify to vandor for received new order using firebase push notification

      }
    }
  }
};

/**=========ORDER SECTION========= */

const validateTransaction = async (txnId: string) => {
  const currentTransaction = await Transaction.findById(txnId);
  if (currentTransaction) {
    if (currentTransaction.status.toLocaleLowerCase() !== "failed") {
      return { status: true, currentTransaction };
    }
  }

  return { status: false, currentTransaction };
};

//Create orders
export const CreateOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Grab current login customer
  const customer = req.user;

  const { txnId, amount, items } = <OrderInputs>req.body;

  if (customer) {
    // Validate transaction
    const { status, currentTransaction } = await validateTransaction(txnId);

    if (!status) {
      return res.status(404).json({ message: "Error with Create Order!" });
    }

    const profile = await Customer.findById(customer._id);
    // create an order ID
    const orderId = `${Math.floor(Math.random() * 89999) + 1000}`;

    const cart = <[CartItem]>req.body;

    let cartItems = Array();
    let netAmount = 0.0;

    let vandorId;

    //Calculate order amount
    const foods = await Food.find()
      .where("_id")
      .in(cart.map((item) => item._id))
      .exec();

    foods.map(food => {
      items.map(({ _id, unit }) => {
        if (food._id == _id) {
          vandorId = food.vandorId;
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
        vandorId: vandorId,
        items: cartItems,
        totalAmount: netAmount,
        paidAmount: amount,
        orderDate: new Date(),
        orderStatus: "Waiting",
        remarks: "",
        deliveryId: "",
        readyTime: 45,
      });

      if (currentOrder) {
        profile.cart = [] as any;

        currentTransaction.vandorId = vandorId;
        currentTransaction.orderId = orderId;
        currentTransaction.status = "CONFIRMED";

        await currentTransaction.save();

        assignOrderForDelivery(String(currentOrder._id), vandorId);

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

export const VerifyOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const offerId = req.params.id;
  const customer = req.user;

  if (customer) {
    const appliedOffer = await Offer.findById(offerId);

    if (appliedOffer) {
      if (appliedOffer.promoType === "USER") {
      } else {
        if (appliedOffer.isActive) {
          return res
            .status(200)
            .json({ message: "Offer is valid", offer: appliedOffer });
        }
      }
    }
  }

  return res.status(400).json({ message: "Offer is not valid" });
};
