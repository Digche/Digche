export class PublicAuthController {
  constructor({ requestPublicOtp, verifyPublicOtp }) {
    this.requestPublicOtp = requestPublicOtp;
    this.verifyPublicOtp = verifyPublicOtp;
  }

  health = (req, res) => {
    res.json({
      service: "auth-service",
      scope: "public-auth",
      status: "ok"
    });
  };

  requestOtp = async (req, res, next) => {
    try {
      const result = await this.requestPublicOtp.execute({
        phone: req.body.phone
      });

      res.json({
        message: "OTP sent successfully",
        phone: result.phone,
        expiresAt: result.expiresAt
      });
    } catch (error) {
      next(error);
    }
  };

  verifyOtp = async (req, res, next) => {
    try {
      const result = await this.verifyPublicOtp.execute({
        phone: req.body.phone,
        code: req.body.code,
        role: req.body.role
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}