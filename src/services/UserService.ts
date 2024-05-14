import {
  AppState,
  LoginRequest,
  LoginResponse,
  NOTIFICATION_CHANNEL,
  PASSWORD_RESET_STAGE,
  PassswordResetResponse,
  PasswordResetEnterCodeData,
  PasswordResetRequest,
  PasswordResetSendRequestData,
  PasswordResetStatus,
  PasswordResetUpdatePasswordData,
  REDIS_KEY_PREFIX,
  SignupRequest,
  UpdatePasswordRequest,
  UpdateProfileRequest,
  UpdateProfileResponse,
  User,
  UserPreference,
} from '../types';
import * as errors from './errors';
import * as database from '../database';
import bcrypt from 'bcrypt';
import { insertUser } from '../database';
import jwt from 'jsonwebtoken';
import config from '../config';
import { TIME_IN_SECONDS, getRandomNumber } from '../utils';
import { addToSendNotificationQueue } from '../queues/workers/sendNotification';

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
    const hashedPassword = await bcrypt.hash(
      request.password,
      config.BCRYPT_NUMBER_OF_ROUNDS,
    );
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
    user.name = '';
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

  public async getProfile(userId: number): Promise<User> {
    const user = await database.getUserById(this.state.databasePool, userId);
    user.password = '';
    return user;
  }

  public async updateProfile(
    userId: number,
    request: UpdateProfileRequest,
  ): Promise<UpdateProfileResponse> {
    if (!request.name) {
      throw new errors.ClientError('nothing to update right now!');
    }
    const user = await database.updateProfile(
      this.state.databasePool,
      request.name,
      userId,
    );
    user.password = '';
    return {
      user,
    };
  }

  public async updatePreferences(userId: number, preferences: UserPreference) {
    await database.updatePreferences(
      this.state.databasePool,
      preferences,
      userId,
    );
  }

  public async updatePassword(userId: number, request: UpdatePasswordRequest) {
    const user = await database.getUserById(this.state.databasePool, userId);
    const doOldPasswordsMatch = await bcrypt.compare(
      request.currentPassword,
      user.password.toString(),
    );
    if (!doOldPasswordsMatch) {
      throw new errors.ClientError('incorrect password!');
    }
    if (!this.isValidPassword(request.newPassword)) {
      throw new errors.ErrInvalidPasswordFormat();
    }
    const hashedPassword = await bcrypt.hash(
      request.newPassword,
      config.BCRYPT_NUMBER_OF_ROUNDS,
    );
    await database.updatePassword(
      this.state.databasePool,
      hashedPassword,
      userId,
    );
  }

  public async resetPassword(
    request: PasswordResetRequest,
  ): Promise<PassswordResetResponse> {
    const user = await database.getUserByEmailOrUsername(
      this.state.databasePool,
      request.data.email,
      '',
    );
    if (!user) {
      throw new errors.ClientError('user not found!');
    }
    switch (request.stage) {
      case PASSWORD_RESET_STAGE.SEND_REQUEST: {
        const otp = getRandomNumber(1000, 9999).toString();
        const data = request.data as PasswordResetSendRequestData;
        const value: PasswordResetStatus = {
          code: otp,
          verified: false,
        };
        await this.state.cache.set(
          `${REDIS_KEY_PREFIX.PASSWORD_RESET}:${data.email}`,
          JSON.stringify(value),
          'EX',
          TIME_IN_SECONDS.ONE_DAY,
        );
        await addToSendNotificationQueue({
          channel: NOTIFICATION_CHANNEL.EMAIL,
          user: {
            type: 'email',
            data: data.email,
          },
          payload: {
            subject: 'Password reset at TYM',
            body: `Your OTP is ${otp}`,
          },
        });
        return {
          stage: PASSWORD_RESET_STAGE.SEND_REQUEST,
          message: 'email sent!',
        };
      }
      case PASSWORD_RESET_STAGE.ENTER_CODE: {
        const data = request.data as PasswordResetEnterCodeData;
        const key = `${REDIS_KEY_PREFIX.PASSWORD_RESET}:${data.email}`;
        const cachedStr = await this.state.cache.get(key);
        if (cachedStr === null) {
          throw new errors.ClientError('invalid email!');
        }
        const cached = JSON.parse(cachedStr) as PasswordResetStatus;
        if (cached.code !== data.code) {
          throw new errors.ClientError('invalid code!');
        }
        await this.state.cache.set(
          key,
          JSON.stringify({
            ...cached,
            verified: true,
          }),
        );
        return {
          stage: PASSWORD_RESET_STAGE.ENTER_CODE,
          message: 'verification successful!',
        };
      }
      case PASSWORD_RESET_STAGE.UPDATE_PASSWORD: {
        const data = request.data as PasswordResetUpdatePasswordData;
        const key = `${REDIS_KEY_PREFIX.PASSWORD_RESET}:${data.email}`;
        const cachedStr = await this.state.cache.get(key);
        if (cachedStr === null) {
          throw new errors.ClientError('invalid email!');
        }
        const cached = JSON.parse(cachedStr) as PasswordResetStatus;
        if (!cached.verified) {
          throw new errors.ClientError('not verified yet!');
        }
        if (!this.isValidPassword(data.newPassword)) {
          throw new errors.ErrInvalidPasswordFormat();
        }
        const hashedPassword = await bcrypt.hash(
          data.newPassword,
          config.BCRYPT_NUMBER_OF_ROUNDS,
        );
        await database.updatePassword(
          this.state.databasePool,
          hashedPassword,
          user.id,
        );
        return {
          stage: PASSWORD_RESET_STAGE.UPDATE_PASSWORD,
          message: 'password updated successfully!',
        };
      }
      default: {
        throw new Error('unhandled stage!');
      }
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
