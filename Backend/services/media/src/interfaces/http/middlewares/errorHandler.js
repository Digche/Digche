export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode || 500;
  const code = error.code || (statusCode >= 500 ? "INTERNAL_ERROR" : "BAD_REQUEST");
  const message =
    statusCode >= 500 ? "Internal server error" : error.message || "Bad request";

  if (statusCode >= 500) {
    console.error(error);
  }

  return res.status(statusCode).json({
    error: {
      code,
      message
    }
  });
}
