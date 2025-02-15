export type userSignUpPayloadType = {
  emailId: string;
  firstName: string;
  lastName?: string;
  password: string;
  mobileNumber?: string;
  authToken?: string;
  otp?: string;
  role: "freelancer" | "client";
  countryCode: string;
  currency: string;
  countryName: string;
};

export type userLoginPayloadType = {
  emailId: string;
  password: string;
  otp?: string;
};

export type configureAmountsPayloadType = {
  monthlyAmount: number;
  emailId: string;
};
