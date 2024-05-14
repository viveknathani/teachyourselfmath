import { Pool } from 'pg';
import { executeQuery } from '.';
import { User, UserPreference } from '../types';
import { snakeCaseToCamelCaseObject } from '../utils';

const queryInsertUser = `
    insert into users
    (name, email, username, password, created_at, updated_at)
    values ($1, $2, $3, $4, now(), now())
    returning *;
`;

const queryGetUser = `
    select * from users
    where email = $1 or username = $2;
`;

const queryUpdateProfile = `
    update users set name = $1, updated_at = now() where id = $2 returning *;
`;

const queryGetUserById = `
    select * from users where id = $1;
`;

const queryUpdatePassword = `
    update users set password = $1 where id = $2;
`;

const queryUpdatePreferences = `
    update users set preferences = $1 where id = $2;
`;

const insertUser = async (pool: Pool, user: Partial<User>): Promise<User> => {
  const queryResponse = await executeQuery({
    pool,
    text: queryInsertUser,
    values: [user.name, user.email, user.username, user.password],
    transaction: true,
  });
  const rawUser = queryResponse.rows?.[0] || null;
  return snakeCaseToCamelCaseObject(rawUser);
};

const getUserByEmailOrUsername = async (
  pool: Pool,
  email: string,
  username: string | null,
): Promise<User> => {
  const queryResponse = await executeQuery({
    pool,
    text: queryGetUser,
    values: [email, username],
  });
  const rawUser = queryResponse.rows?.[0] || null;
  return snakeCaseToCamelCaseObject(rawUser);
};

const getUserById = async (pool: Pool, id: number): Promise<User> => {
  const queryResponse = await executeQuery({
    pool,
    text: queryGetUserById,
    values: [id],
  });
  const rawUser = queryResponse.rows?.[0] || null;
  return snakeCaseToCamelCaseObject(rawUser);
};

const updateProfile = async (
  pool: Pool,
  name: string,
  userId: number,
): Promise<User> => {
  const queryResponse = await executeQuery({
    pool,
    text: queryUpdateProfile,
    transaction: true,
    values: [name, userId],
  });
  const rawUser = queryResponse.rows?.[0] || null;
  return snakeCaseToCamelCaseObject(rawUser);
};

const updatePassword = async (pool: Pool, password: string, userId: number) => {
  const queryResponse = await executeQuery({
    pool,
    text: queryUpdatePassword,
    transaction: true,
    values: [password, userId],
  });
  const rawUser = queryResponse.rows?.[0] || null;
  return snakeCaseToCamelCaseObject(rawUser);
};

const updatePreferences = async (
  pool: Pool,
  preferences: UserPreference,
  userId: number,
) => {
  const queryResponse = await executeQuery({
    pool,
    text: queryUpdatePreferences,
    transaction: true,
    values: [JSON.stringify(preferences), userId],
  });
  const rawUser = queryResponse.rows?.[0] || null;
  return snakeCaseToCamelCaseObject(rawUser);
};

export {
  insertUser,
  getUserByEmailOrUsername,
  getUserById,
  updateProfile,
  updatePassword,
  updatePreferences,
};
