import crypto from "crypto";

const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"]
]);

const UPLOAD_TARGETS = {
  PROFILE_PHOTO: "profile_photo",
  DISH_IMAGE: "dish_image"
};

export class CreateImageUploadPresign {
  constructor({
    storageService,
    profileMaxSizeBytes,
    dishMaxSizeBytes,
    presignExpiresSeconds
  }) {
    this.storageService = storageService;
    this.profileMaxSizeBytes = profileMaxSizeBytes;
    this.dishMaxSizeBytes = dishMaxSizeBytes;
    this.presignExpiresSeconds = presignExpiresSeconds;
  }

  async execute({
    target,
    contentType,
    actor,
    dishId = null,
    maxSizeBytes = null
  }) {
    const normalizedTarget = this.normalizeTarget(target);
    const normalizedContentType = this.normalizeContentType(contentType);
    const ext = ALLOWED_IMAGE_TYPES.get(normalizedContentType);

    const key = this.createKey({
      target: normalizedTarget,
      actor,
      dishId,
      ext
    });

    const resolvedMaxSizeBytes = this.normalizeMaxSizeBytes(
      maxSizeBytes,
      normalizedTarget === UPLOAD_TARGETS.DISH_IMAGE
        ? this.dishMaxSizeBytes
        : this.profileMaxSizeBytes
    );

    const result = await this.storageService.createPresignedImagePost({
      key,
      contentType: normalizedContentType,
      expiresInSeconds: this.presignExpiresSeconds,
      maxSizeBytes: resolvedMaxSizeBytes
    });

    return {
      target: normalizedTarget,
      contentType: normalizedContentType,
      maxSizeBytes: resolvedMaxSizeBytes,
      ...result
    };
  }

  normalizeTarget(target) {
    const normalizedTarget = String(target || "").trim();

    if (!Object.values(UPLOAD_TARGETS).includes(normalizedTarget)) {
      throw new AppInputError("Invalid upload target", "INVALID_UPLOAD_TARGET");
    }

    return normalizedTarget;
  }

  normalizeContentType(contentType) {
    const normalizedContentType = String(contentType || "").trim().toLowerCase();

    if (!ALLOWED_IMAGE_TYPES.has(normalizedContentType)) {
      throw new AppInputError("Invalid image content type", "INVALID_CONTENT_TYPE");
    }

    return normalizedContentType;
  }

  normalizeMaxSizeBytes(maxSizeBytes, fallback) {
    if (maxSizeBytes === null || maxSizeBytes === undefined || maxSizeBytes === "") {
      return fallback;
    }

    const normalizedMaxSizeBytes = Number(maxSizeBytes);

    if (
      !Number.isInteger(normalizedMaxSizeBytes) ||
      normalizedMaxSizeBytes < 1 ||
      normalizedMaxSizeBytes > fallback
    ) {
      throw new AppInputError("Invalid max size", "INVALID_MAX_SIZE_BYTES");
    }

    return normalizedMaxSizeBytes;
  }

  createKey({ target, actor, dishId, ext }) {
    const actorId = sanitizeSegment(actor?.id || actor?.sub || "system");
    const scope = sanitizeSegment(actor?.scope || "internal");
    const selectedRole = sanitizeSegment(actor?.selectedRole || actor?.role || "unknown");
    const id = crypto.randomUUID();

    if (target === UPLOAD_TARGETS.PROFILE_PHOTO) {
      return `profiles/${scope}/${selectedRole}/${actorId}/${id}.${ext}`;
    }

    const safeDishId = sanitizeSegment(dishId || "draft");

    return `dishes/${safeDishId}/${id}.${ext}`;
  }
}

export class AppInputError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "AppInputError";
    this.statusCode = 400;
    this.code = code;
  }
}

function sanitizeSegment(value) {
  return String(value || "unknown")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "unknown";
}
