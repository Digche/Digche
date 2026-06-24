import { env } from "./config/env.js";
import { ArvanStorageService } from "./infrastructure/storage/ArvanStorageService.js";
import { CreateImageUploadPresign } from "./application/use-cases/CreateImageUploadPresign.js";
import { MediaController } from "./interfaces/http/controllers/MediaController.js";
import {
  createAuthMiddleware,
  createInternalAuthMiddleware
} from "./interfaces/http/middlewares/authMiddleware.js";

export function createContainer() {
  const storageService = new ArvanStorageService({
    region: env.arvan.region,
    endpoint: env.arvan.endpoint,
    accessKey: env.arvan.accessKey,
    secretKey: env.arvan.secretKey,
    bucket: env.arvan.bucket,
    publicBaseUrl: env.arvan.publicBaseUrl,
    forcePathStyle: env.arvan.forcePathStyle,
    defaultAcl: env.arvan.defaultAcl
  });

  const createImageUploadPresign = new CreateImageUploadPresign({
    storageService,
    profileMaxSizeBytes: env.uploads.profileMaxSizeBytes,
    dishMaxSizeBytes: env.uploads.dishMaxSizeBytes,
    presignExpiresSeconds: env.uploads.presignExpiresSeconds
  });

  const mediaController = new MediaController({
    createImageUploadPresign
  });

  return {
    mediaController,
    authMiddleware: createAuthMiddleware({
      jwtSecret: env.jwt.secret
    }),
    internalAuthMiddleware: createInternalAuthMiddleware({
      internalApiKey: env.internalApiKey
    })
  };
}
