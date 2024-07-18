export interface CreateVandorInput{

    name: string;
    ownerName: string;
    foodType: [string];
    pinCode: string;
    address: string;
    phone: string;
    email: string;
    password: string;
}

export interface EditVandorInputs{
    name: string;
    address: string;
    phone: string;
    foodTypes: [string];
}


export interface VandorLoginInputs{
    email: string;
    password: string;
}

export interface VandorPayLoad {
    _id: string;
    email: string;
    name: string;
    foodTypes: [string];
}

export interface CreateOfferInputs {
    offerType: string;
    vandors: [any];
    title: string;
    description: string;
    minValue: number;
    offerAmount: number;
    startValidity: Date;
    endValidity: Date;
    promocode: string;
    promoType: string;
    bank: [any];
    bins: [any];
    pincode: string;
    isActive: boolean;
}