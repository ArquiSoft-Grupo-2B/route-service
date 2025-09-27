import { Injectable, Logger } from '@nestjs/common';
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
} from '../interfaces/auth-service.interface';

@Injectable()
export class AuthServiceClient {
  private readonly logger = new Logger(AuthServiceClient.name);
  private readonly authServiceUrl: string;

  constructor() {
    // TODO: Move to environment variables
    this.authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:8000/graphql';
  }

  private async executeQuery<T>(
    query: string,
    variables?: Record<string, any>,
  ): Promise<GraphQLResponse<T>> {
    try {
      const response = await fetch(this.authServiceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: variables || {},
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<T> = await response.json();
      
      if (result.errors && result.errors.length > 0) {
        this.logger.error('GraphQL errors:', result.errors);
      }

      return result;
    } catch (error) {
      this.logger.error('Error executing GraphQL query:', error);
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

    const result = await this.executeQuery<CreateUserResponse>(mutation, { userInput });
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

    const result = await this.executeQuery<LoginUserResponse>(mutation, { email, password });
    return result.data?.loginUser || null;
  }

  /**
   * Actualiza un usuario
   */
  async updateUser(userId: string, userInput: UserInput): Promise<UserType | null> {
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

    const result = await this.executeQuery<UpdateUserResponse>(mutation, { userId, userInput });
    return result.data?.updateUser || null;
  }

  /**
   * Envía email de reseteo de contraseña
   */
  async sendPasswordResetEmail(email: string): Promise<{ success: boolean; response: string }> {
    const mutation = `
      mutation SendPasswordResetEmail($email: String!) {
        sendPasswordResetEmail(email: $email) {
          success
          response
        }
      }
    `;

    const result = await this.executeQuery<SendPasswordResetResponse>(mutation, { email });
    return result.data?.sendPasswordResetEmail || { success: false, response: 'Error' };
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

    const result = await this.executeQuery<DeleteUserResponse>(mutation, { userId });
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
}