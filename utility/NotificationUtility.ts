// Email 

// Notification 

// OTP
export const GenerateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 90000)
    let expiry = new Date()
    expiry.setTime( new Date().getTime() + (30 * 60 * 1000))

    return { otp, expiry}
}

export const onRequestOTP = async (otp: number, toPhoneNumber: string) => {
    const accountSid = "AC78f30a920fa5d923cd657249996ea3d0";
    const authToken = "d8eb1baab098f184b9fd753642367cc8";
    const client = require('twilio')(accountSid, authToken);

    const response = await client .messages.create({
        body: 'Your OTP is ${otp}',
        from: '+254114117903',
        to: `+254${toPhoneNumber}`,
    })

    return response;
}