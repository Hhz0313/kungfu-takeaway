/**
 * @desc    Standard API response utility
 * @param   {number} httpStatusCode - HTTP status code
 * @param   {number} customCode - Custom code
 * @param   {string} message - Response message
 * @param   {*} data - Response data
 * @returns {object}
 */
const sendResponse = (res, httpStatusCode, customCode, message, data = null) => {
  return res.status(httpStatusCode).json({
    code: customCode,
    message: message,
    data: data,
  });
};

const successResponse = (res, data = null, message = 'success') => {
  // HTTP 200 for success, custom code 0 in body
  return sendResponse(res, 200, 0, message, data); 
};

const errorResponse = (res, httpStatusCode = 500, message = 'error', data = null) => {
  // For errors, the httpStatusCode and customCode in body can be the same (e.g., 400, 404, 500)
  // Or you can define a different custom code for errors if needed, e.g. -1 for all server errors.
  // Sticking to httpStatusCode for customCode for now for simplicity in errors.
  return sendResponse(res, httpStatusCode, httpStatusCode, message, data);
};

module.exports = {
  sendResponse,
  successResponse,
  errorResponse,
}; 