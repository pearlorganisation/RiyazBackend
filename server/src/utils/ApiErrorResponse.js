class ApiErrorResponse extends Error {
  constructor(message, statusCode, stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
    this.name = "Api Error";
    if (!stack) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = stack;
    }
  }
}

export default ApiErrorResponse;
