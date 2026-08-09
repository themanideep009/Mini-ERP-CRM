export const successResponse = (res, statusCode, message, data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (res, statusCode, message, errorCode = null, details = null) => {
  const payload = {
    success: false,
    message,
  };
  if (errorCode) {
    payload.error = errorCode;
  }
  if (details) {
    payload.details = details;
  }
  return res.status(statusCode).json(payload);
};
