const sendSuccess = (res, statusCode, message, data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendError = (res, statusCode, message, error = null) => {
  const response = {
    success: false,
    message,
  };
  if (error && process.env.NODE_ENV === 'development') {
    response.error = error;
  }
  return res.status(statusCode).json(response);
};

module.exports = { sendSuccess, sendError };
