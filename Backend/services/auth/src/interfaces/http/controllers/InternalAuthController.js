export class InternalAuthController {
  constructor({ resolveActorProfiles, verifyAccessToken }) {
    this.resolveActorProfiles = resolveActorProfiles;
    this.verifyAccessToken = verifyAccessToken;
  }

  verifyToken = async (req, res, next) => {
    try {
      const result = await this.verifyAccessToken.execute({
        accessToken: req.body.accessToken || req.body.access_token
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  resolveProfiles = async (req, res, next) => {
    try {
      const result = await this.resolveActorProfiles.execute({
        participants: req.body.participants
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
