class ApiResponse {
  static success(res, statusCode, message, data = null) {
    const body = { success: true, message };
    if (data !== null) body.data = data;
    return res.status(statusCode).json(body);
  }

  static created(res, message, data = null) {
    return ApiResponse.success(res, 201, message, data);
  }

  static paginated(res, message, data, pagination) {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
    });
  }
}

export default ApiResponse;
