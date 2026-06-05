export type IEmailLoginPayload = {
  email: string;
  password?: string;
};

export type IPhoneLoginPayload = {
  phoneNumber: string;
  password?: string;
};

export type IGoogleLoginPayload = {
  googleId: string;
  email: string;
  name: string;
};

export type ISelectCompanyPayload = {
  companyId: string;
};

export type ILoginResponse = {
  accessToken: string;
  needsCompanySelection: boolean;
  associatedCompanies?: { id: string; name: string }[];
  user: {
    id: string;
    name: string;
    email?: string;
    phoneNumber?: string;
    role: string;
  };
};
