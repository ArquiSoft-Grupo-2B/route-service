// Interfaces para los tipos del Authentication Service

export interface UserType {
  id: string;
  email: string;
  alias?: string;
  photo_url?: string;
}

export interface TokenType {
  local_id: string;
  email: string;
  alias: string;
  id_token: string;
  registered: boolean;
  refresh_token: string;
  expires_in: string;
}

export interface UserInput {
  email: string;
  password: string;
  alias?: string;
}

export interface PasswordResetResponse {
  success: boolean;
  response: string;
}

// GraphQL Response wrapper
export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

// Specific query responses
export interface GetUserResponse {
  getUser: UserType | null;
}

export interface ListUsersResponse {
  listUsers: UserType[];
}

export interface CreateUserResponse {
  createUser: UserType;
}

export interface LoginUserResponse {
  loginUser: TokenType | null;
}

export interface UpdateUserResponse {
  updateUser: UserType | null;
}

export interface SendPasswordResetResponse {
  sendPasswordResetEmail: PasswordResetResponse;
}

export interface DeleteUserResponse {
  deleteUser: boolean;
}