export class TokenService {
  signAccessToken(payload) {
    throw new Error("TokenService.signAccessToken is not implemented");
  }

  generateRefreshToken() {
    throw new Error("TokenService.generateRefreshToken is not implemented");
  }

  hashRefreshToken(refreshToken) {
    throw new Error("TokenService.hashRefreshToken is not implemented");
  }

  verifyAccessToken(token) {
    throw new Error("TokenService.verifyAccessToken is not implemented");
  }
}