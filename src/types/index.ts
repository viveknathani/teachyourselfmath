enum HTTP_CODE {
  OK = 200,
  CREATED = 201,
  CLIENT_ERROR = 400,
  UNAUTHORIZED = 401,
  SERVER_ERROR = 500,
}

interface ApiResponse {
  status: 'success' | 'error';
  data?: any;
  message?: string;
}

export { ApiResponse, HTTP_CODE };
