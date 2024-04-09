const otpTemplate = (otp: string) => {
  return `Your One-Time Password (OTP) for [HPCA Service] is:${otp.toString()}

	Please enter this OTP within 10 minutes to complete your authentication.`;
};

const documentApproved = (name: string) => {
  return `Dear ${name?.slice(0, 12) || "Customer"},

	We are pleased to inform you that your documents have been successfully reviewed and approved by HPCA.

	If you have any questions or concerns regarding the approval process or the approved documents, please feel free to contact our support team

	Thank you for choosing HPCA.`;
};

const documentRejected = (name: string) => {
  return `Dear ${name?.slice(0, 12) || "Customer"},
	We are sorry to inform you that your documents have been rejected by HPCA.
	Thank you for choosing HPCA.`;
};
export { otpTemplate, documentApproved, documentRejected };
