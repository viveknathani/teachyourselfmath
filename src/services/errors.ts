export class ClientError extends Error {}

export class ErrInvalidEmailFormat extends ClientError {
  constructor() {
    super('Invalid email format. Check RFC 5322.');
    Object.setPrototypeOf(this, ErrInvalidEmailFormat.prototype);
  }
}

export class ErrInvalidPasswordFormat extends ClientError {
  constructor() {
    super(
      'Password format: Min. 8 chars, atleast 1 number, ' +
        '1 lowercase char, 1 uppercase char, 1 special char',
    );
    Object.setPrototypeOf(this, ErrInvalidPasswordFormat.prototype);
  }
}

export class ErrEmailOrUsernameExists extends ClientError {
  constructor() {
    super('This email/username already exists.');
    Object.setPrototypeOf(this, ErrEmailOrUsernameExists.prototype);
  }
}

export class ErrInvalidEmailPassword extends ClientError {
  constructor() {
    super('Invalid email/password combination.');
    Object.setPrototypeOf(this, ErrInvalidEmailPassword.prototype);
  }
}

export class ErrUserNotFound extends ClientError {
  constructor() {
    super('User not found.');
    Object.setPrototypeOf(this, ErrUserNotFound.prototype);
  }
}

export class DataValidationError extends ClientError {
  public details: any;
  constructor(message: string, details: any | null = null) {
    super(message);
    this.details = details;
    Object.setPrototypeOf(this, DataValidationError.prototype);
  }
}

export enum ErrorCodesOfSQL {
  UNIQUE_CONSTRAINT_VIOLATION = '23505',
}
