export class AdminAuthController {
  health = (req, res) => {
    res.json({
      service: "auth-service",
      scope: "admin-auth",
      status: "ok"
    });
  };

  requestOtp = async (req, res) => {
    res.status(501).json({
      message: "Admin OTP request is not implemented yet"
    });
  };

  verifyOtp = async (req, res) => {
    res.status(501).json({
      message: "Admin OTP verification is not implemented yet"
    });
  };
}