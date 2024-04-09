import axios from "axios";

const textLocalUrl = "https://api.textlocal.in/send/?";

const { MESSAGE_API_KEY, MESSAGE_SENDER_CODE } = process.env;
const textLocalApi = async (phoneNumber: string, message: string) => {
  if (phoneNumber.length === 10 && message) {
    return await axios
      .request({
        method: "get",
        url: textLocalUrl,
        params: {
          apikey: MESSAGE_API_KEY,
          numbers: `+91${phoneNumber}`,
          message: message,
          sender: MESSAGE_SENDER_CODE,
        },
      })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
				// eslint-disable-next-line no-console
				console.log(err);
        return {
          message: "Something went wrong",
          status: 500,
          stackTrace: err,
        };
      });
  } else {
    return {
      message: "Please Pass 10 digit phone number and message",
      status: 301,
    };
  }
};

export default textLocalApi;
