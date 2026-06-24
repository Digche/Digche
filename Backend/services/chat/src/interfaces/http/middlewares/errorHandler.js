import { AppError } from "../../../application/errors/AppError.js";

export function errorHandler(error, request, reply) {
  if (error instanceof AppError) {
    return reply.code(error.statusCode).send({
      error: {
        code: error.code,
        message: error.message
      }
    });
  }

  request.log.error(error);

  return reply.code(500).send({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error"
    }
  });
}
