export class PublicAuthController {
  health = (req, res) => {
    res.json({
      service: "auth-service",
      scope: "public-auth",
      status: "ok"
    });
  };

  requestOtp = async (req, res) => {
    res.status(501).json({
      message: "Public OTP request is not implemented yet"
    });
  };

  verifyOtp = async (req, res) => {
    res.status(501).json({
      message: "Public OTP verification is not implemented yet"
    });
  };
}