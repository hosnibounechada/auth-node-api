import Twilio from "twilio";

class TwilioService {
  private static instance: TwilioService;
  private static twilioServiceSID: string;
  private static client: Twilio.Twilio;

  private constructor() {}

  public init(
    twilioAccountSID: string,
    twilioAuthSID: string,
    twilioServiceSID: string
  ) {
    TwilioService.twilioServiceSID = twilioServiceSID;
    TwilioService.client = Twilio(twilioAccountSID, twilioAuthSID);
  }

  static getInstance() {
    if (!TwilioService.instance) TwilioService.instance = new TwilioService();

    return TwilioService.instance;
  }

  public async sendPhoneCode(phone: string) {
    const response = await TwilioService.client.verify
      .services(TwilioService.twilioServiceSID)
      .verifications.create({ to: phone, channel: "sms" });

    return response.status;
  }
  public async verifyPhoneCode(phone: string, code: string) {
    const response = await TwilioService.client.verify
      .services(TwilioService.twilioServiceSID)
      .verificationChecks.create({ to: phone, code: code });

    return response.status;
  }
}

export default TwilioService.getInstance();
