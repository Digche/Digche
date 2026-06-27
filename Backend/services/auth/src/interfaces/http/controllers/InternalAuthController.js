export class InternalAuthController {
  constructor({ resolveActorProfiles }) {
    this.resolveActorProfiles = resolveActorProfiles;
  }

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
