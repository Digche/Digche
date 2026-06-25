export class MediaController {
  constructor({ createImageUploadPresign }) {
    this.createImageUploadPresign = createImageUploadPresign;
  }

  health = (req, res) => {
    res.json({
      service: "media-service",
      status: "ok"
    });
  };

  presignProfilePhoto = async (req, res, next) => {
    try {
      const result = await this.createImageUploadPresign.execute({
        target: "profile_photo",
        contentType: req.body.contentType || req.body.content_type,
        actor: this.actorFromAuth(req.auth),
        maxSizeBytes: req.body.maxSizeBytes || req.body.max_size_bytes || null
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  presignDishImage = async (req, res, next) => {
    try {
      const result = await this.createImageUploadPresign.execute({
        target: "dish_image",
        contentType: req.body.contentType || req.body.content_type,
        dishId: req.body.dishId || req.body.dish_id || null,
        actor: this.actorFromAuth(req.auth),
        maxSizeBytes: req.body.maxSizeBytes || req.body.max_size_bytes || null
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  presignInternalImage = async (req, res, next) => {
    try {
      const result = await this.createImageUploadPresign.execute({
        target: req.body.target,
        contentType: req.body.contentType || req.body.content_type,
        dishId: req.body.dishId || req.body.dish_id || null,
        actor: this.actorFromAuth(req.auth),
        maxSizeBytes: req.body.maxSizeBytes || req.body.max_size_bytes || null
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  actorFromAuth(auth) {
    return {
      id: auth?.sub || auth?.id,
      scope: auth?.scope,
      selectedRole: auth?.selectedRole,
      role: auth?.role,
      phone: auth?.phone
    };
  }
}
