export class PublicAuthController {
  constructor({
    requestPublicOtp,
    verifyPublicOtp,
    refreshPublicSession,
    logoutSession
  }) {
    this.requestPublicOtp = requestPublicOtp;
    this.verifyPublicOtp = verifyPublicOtp;
    this.refreshPublicSession = refreshPublicSession;
    this.logoutSession = logoutSession;
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

  refresh = async (req, res, next) => {
    try {
      const result = await this.refreshPublicSession.execute({
        refreshToken: req.body.refreshToken
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  logout = async (req, res, next) => {
    try {
      const result = await this.logoutSession.execute({
        refreshToken: req.body.refreshToken
      });

      res.json({
        message: "Logged out successfully",
        ...result
      });
    } catch (error) {
      next(error);
    }
  };
}