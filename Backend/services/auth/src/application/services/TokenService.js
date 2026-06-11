export class TokenService {
  signAccessToken(payload) {
    throw new Error("TokenService.signAccessToken is not implemented");
  }

  verifyAccessToken(token) {
    throw new Error("TokenService.verifyAccessToken is not implemented");
  }

  signRegistrationToken(payload) {
    throw new Error("TokenService.signRegistrationToken is not implemented");
  }

  verifyRegistrationToken(token) {
    throw new Error("TokenService.verifyRegistrationToken is not implemented");
  }

  generateRefreshToken() {
    throw new Error("TokenService.generateRefreshToken is not implemented");
  }

  hashRefreshToken(token) {
    throw new Error("TokenService.hashRefreshToken is not implemented");
  }
}