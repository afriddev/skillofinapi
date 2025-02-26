"use server";

import { responseEnums } from "../enums/responseEnums";

export async function sendOtp(
  emailId: string,
  otp: number,
  method?: "LOGIN" | "SIGNUP" | "RESET_PASSWORD"
): Promise<responseEnums> {
  const url = "https://freeemailapi.vercel.app/sendEmail/";

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      fromEmail: process.env.FROM_EMAIL,
      passkey: process.env.PASS_KEY,
      toEmail: emailId,
      body: `Dear User,
    
    We have received a request to ${method === "LOGIN" ? "log in" : method === "RESET_PASSWORD" ? "reset your password" : "sign up"} on Skillofin.
    
    Your one-time verification code is: **${otp}**. Please enter this code to complete the process.
    
    If you did not request this action, please disregard this email.
    
    For any support or inquiries, feel free to contact us at contact@skillofin.com.
    
    Best regards,  
    The Skillofin Team  
    Visit us at: www.skillofin.com`,
      title: "Skillofin - OTP Verification",
      subject: `Your OTP for ${method === "LOGIN" ? "Login" : method === "RESET_PASSWORD" ? "Password Reset" : "Sign Up"} on Skillofin`,
    }),
    
  });
  const result = await response.json();

  return result?.message === "emailSendSuccess"
    ? responseEnums?.SUCCESS
    : responseEnums?.ERROR;
}
