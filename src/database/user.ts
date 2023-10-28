import { Pool } from 'pg';
import { executeQuery } from '.';
import { User } from '../types';
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

const insertUser = async (pool: Pool, user: Partial<User>): Promise<User> => {
  const queryResponse = await executeQuery({
    pool,
    text: queryInsertUser,
    values: [user.name, user.email, user.username, user.password],
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

export { insertUser, getUserByEmailOrUsername };
