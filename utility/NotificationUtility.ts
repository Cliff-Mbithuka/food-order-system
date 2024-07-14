// Email 

// Notification 

// OTP
export const GenerateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 90000)
    let expiry = new Date()
    expiry.setTime( new Date().getTime() + (30 * 60 * 1000))

    return { otp, expiry}
}

export const