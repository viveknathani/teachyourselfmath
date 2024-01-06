import {
  AppState,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  User,
} from '../types';
import * as errors from './errors';
import * as database from '../database';
import bcrypt from 'bcrypt';
import { insertUser } from '../database';
import jwt from 'jsonwebtoken';
import config from '../config';

export class UserService {
  private static instance: UserService;
  private state: AppState;
  private constructor(state: AppState) {
    this.state = state;
  }

  public static getInstance(state: AppState): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService(state);
    }
    return UserService.instance;
  }

  public async signup(request: SignupRequest): Promise<User> {
    if (!this.isValidEmail(request.email)) {
      throw new errors.ErrInvalidEmailFormat();
    }
    if (!this.isValidPassword(request.password)) {
      throw new errors.ErrInvalidPasswordFormat();
    }
    const existingUser = await database.getUserByEmailOrUsername(
      this.state.databasePool,
      request.email,
      request.username,
    );
    if (existingUser !== null) {
      throw new errors.ErrEmailOrUsernameExists();
    }
    const hashedPassword = await bcrypt.hash(request.password, 10);
    const insertedUser = await insertUser(this.state.databasePool, {
      ...request,
      password: hashedPassword,
    });
    return insertedUser;
  }

  public async login(request: LoginRequest): Promise<LoginResponse> {
    const user = await database.getUserByEmailOrUsername(
      this.state.databasePool,
      request.email,
      null,
    );
    if (user === undefined || user === null) {
      throw new errors.ErrInvalidEmailPassword();
    }
    const isGood = await bcrypt.compare(
      request.password,
      user.password.toString(),
    );
    if (!isGood) {
      throw new errors.ErrInvalidEmailPassword();
    }
    user.password = '';
    return {
      user,
      authToken: this.createAuthToken(user),
    };
  }

  public async verifyAndDecodeToken(
    authToken: string | null,
  ): Promise<User | null> {
    try {
      if (authToken === null) {
        return authToken;
      }
      const decoded = jwt.verify(authToken, config.JWT_SECRET);
      return decoded as User;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  private createAuthToken(user: User): string {
    return jwt.sign(user, config.JWT_SECRET, {
      expiresIn: '60d',
    });
  }

  private isValidEmail(email: string): boolean {
    const regexEmail = // eslint-disable-next-line no-control-regex
      /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
    return regexEmail.test(email);
  }

  private isValidPassword(password: string): boolean {
    const minLength = 8;
    let length = 0;

    let hasNumber = false;
    let hasUppercase = false;
    let hasLowercase = false;
    let hasSpecial = false;

    for (let i = 0; i < password.length; ++i) {
      const c = password[i];

      if (c >= '0' && c <= '9') {
        hasNumber = true;
      } else if (c >= 'a' && c <= 'z') {
        hasLowercase = true;
      } else if (c >= 'A' && c <= 'Z') {
        hasUppercase = true;
      } else if (c >= ' ' && c <= '~') {
        hasSpecial = true;
      } else {
        return false;
      }
      ++length;
    }

    return (
      length >= minLength &&
      hasNumber &&
      hasLowercase &&
      hasUppercase &&
      hasSpecial
    );
  }
}
