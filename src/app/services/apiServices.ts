"use server";

import { responseEnums } from "../enums/responseEnums";

export async function sendOtp(emailId: string, otp:number,method?: "LOGIN" | "SIGNUP"):Promise<responseEnums> {
  const url = "https://freeemailapi.vercel.app/sendEmail/";

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      toEmail: emailId,
      body: `Your verification code for ${
        method === "LOGIN" ? "Login" : "Sign up"
      } ${otp}`,
      title: "Track me ",
      subject: `Otp for ${method === "LOGIN" ? "Login" : "Sign Up"}`,
    }),
  });
  const result = await response.json();

  return result?.message === "emailSendSuccess"
    ? responseEnums?.SUCCESS
    : responseEnums?.ERROR;
}
