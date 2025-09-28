// Interfaces para los tipos del Authentication Service

export interface UserType {
  id: string;
  email: string;
  alias?: string;
  photoUrl?: string;
}

export interface TokenType {
  localId: string;
  email: string;
  alias: string;
  idToken: string;
  registered: boolean;
  refreshToken: string;
  expiresIn: string;
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

export interface VerifyTokenResponse {
  verifyToken: {
    uid: string;
    email: string;
    emailVerified: boolean;
    userInfo?: {
      name?: string;
      userId?: string;
    } | null;
  };
}
