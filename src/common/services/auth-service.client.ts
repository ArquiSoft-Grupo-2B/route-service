import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
type GraphQLClient = import('graphql-request').GraphQLClient;
import {
  UserType,
  TokenType,
  UserInput,
  GraphQLResponse,
  GetUserResponse,
  ListUsersResponse,
  CreateUserResponse,
  LoginUserResponse,
  UpdateUserResponse,
  SendPasswordResetResponse,
  DeleteUserResponse,
  VerifyTokenResponse,
} from '../interfaces/auth-service.interface';

@Injectable()
export class AuthServiceClient {
  private readonly logger = new Logger(AuthServiceClient.name);
  private readonly graphQLClientPromise: Promise<GraphQLClient>;

  constructor(private readonly configService: ConfigService) {
    const nodeEnv =
      this.configService.get<string>('NODE_ENV')?.toLowerCase() ?? 'production';
    const isDevelopment = nodeEnv === 'development';

    const authServiceUrl =
      this.configService.get<string>('AUTH_SERVICE_URL') ||
      (isDevelopment ? 'http://localhost:8000/graphql' : undefined);

    if (!authServiceUrl) {
      throw new Error('AUTH_SERVICE_URL debe estar configurado');
    }

    this.graphQLClientPromise = import('graphql-request').then(
      ({ GraphQLClient: GraphQLClientCtor }) =>
        new GraphQLClientCtor(authServiceUrl),
    );
  }

  private async executeQuery<T>(
    query: string,
    variables?: Record<string, any>,
  ): Promise<GraphQLResponse<T>> {
    try {
      const client = await this.graphQLClientPromise;
      const result = await client.request<T>(query, variables || {});
      return { data: result };
    } catch (error: any) {
      if (error?.response?.errors) {
        this.logger.error('Errores GraphQL:', error.response.errors);
        return {
          errors: error.response.errors.map((err: any) => ({
            message: err.message,
            locations: err.locations,
            path: err.path,
          })),
        };
      }

      this.logger.error('Error ejecutando consulta GraphQL:', error);
      throw error;
    }
  }

  /**
   * Obtiene un usuario por su ID
   */
  async getUserById(userId: string): Promise<UserType | null> {
    const query = `
      query GetUser($userId: String!) {
        getUser(userId: $userId) {
          id
          email
          alias
          photoUrl
        }
      }
    `;

    const result = await this.executeQuery<GetUserResponse>(query, { userId });
    return result.data?.getUser || null;
  }

  /**
   * Lista todos los usuarios
   */
  async listUsers(): Promise<UserType[]> {
    const query = `
      query ListUsers {
        listUsers {
          id
          email
          alias
          photoUrl
        }
      }
    `;

    const result = await this.executeQuery<ListUsersResponse>(query);
    return result.data?.listUsers || [];
  }

  /**
   * Crea un nuevo usuario
   */
  async createUser(userInput: UserInput): Promise<UserType | null> {
    const mutation = `
      mutation CreateUser($userInput: UserInput!) {
        createUser(userInput: $userInput) {
          id
          email
          alias
          photoUrl
        }
      }
    `;

    const result = await this.executeQuery<CreateUserResponse>(mutation, {
      userInput,
    });
    return result.data?.createUser || null;
  }

  /**
   * Inicia sesión de usuario
   */
  async loginUser(email: string, password: string): Promise<TokenType | null> {
    const mutation = `
      mutation LoginUser($email: String!, $password: String!) {
        loginUser(email: $email, password: $password) {
          localId
          email
          alias
          idToken
          registered
          refreshToken
          expiresIn
        }
      }
    `;

    const result = await this.executeQuery<LoginUserResponse>(mutation, {
      email,
      password,
    });
    return result.data?.loginUser || null;
  }

  /**
   * Actualiza un usuario
   */
  async updateUser(
    userId: string,
    userInput: UserInput,
  ): Promise<UserType | null> {
    const mutation = `
      mutation UpdateUser($userId: String!, $userInput: UserInput!) {
        updateUser(userId: $userId, userInput: $userInput) {
          id
          email
          alias
          photoUrl
        }
      }
    `;

    const result = await this.executeQuery<UpdateUserResponse>(mutation, {
      userId,
      userInput,
    });
    return result.data?.updateUser || null;
  }

  /**
   * Envía email de reseteo de contraseña
   */
  async sendPasswordResetEmail(
    email: string,
  ): Promise<{ success: boolean; response: string }> {
    const mutation = `
      mutation SendPasswordResetEmail($email: String!) {
        sendPasswordResetEmail(email: $email) {
          success
          response
        }
      }
    `;

    const result = await this.executeQuery<SendPasswordResetResponse>(
      mutation,
      { email },
    );
    return (
      result.data?.sendPasswordResetEmail || {
        success: false,
        response: 'Error',
      }
    );
  }

  /**
   * Elimina un usuario
   */
  async deleteUser(userId: string): Promise<boolean> {
    const mutation = `
      mutation DeleteUser($userId: String!) {
        deleteUser(userId: $userId)
      }
    `;

    const result = await this.executeQuery<DeleteUserResponse>(mutation, {
      userId,
    });
    return result.data?.deleteUser || false;
  }

  /**
   * Valida si un usuario existe y está activo
   * Útil para guards de autenticación
   */
  async validateUser(userId: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      return user !== null;
    } catch (error) {
      this.logger.error(`Error validating user ${userId}:`, error);
      return false;
    }
  }

  async verifyToken(
    idToken: string,
  ): Promise<VerifyTokenResponse['verifyToken'] | null> {
    const mutation = `
      mutation VerifyToken($idToken: String!) {
        verifyToken(idToken: $idToken) {
          uid
          email
          emailVerified
          userInfo {
            name
            userId
          }
        }
      }
    `;

    const result = await this.executeQuery<VerifyTokenResponse>(mutation, {
      idToken,
    });
    return result.data?.verifyToken || null;
  }
}
