import { Pool } from 'pg';
import { executeQuery } from '.';
import { UserConfiguration } from '../types';
import { snakeCaseToCamelCaseObject } from '../utils';

const queryInsertUserConfiguration = `
    insert into user_configurations
    (user_id, tags, schedule, last_ran_at, count_easy, count_medium, count_hard, created_at)
    values ($1, $2, $3, $4, $5, $6, $7, now())
    returning *;
`;

const queryDeleteUserConfiguration = `
    delete from user_configurations
    where id = $1 and user_id = $2
    returning *;
`;

const queryGetUserConfigurations = `
    select *
    from user_configurations
    where user_id = $1
    order by created_at desc;
`;

const insertUserConfiguration = async (
  pool: Pool,
  userConfiguration: Partial<UserConfiguration>,
): Promise<UserConfiguration> => {
  const queryResponse = await executeQuery({
    pool,
    text: queryInsertUserConfiguration,
    values: [
      userConfiguration.userId,
      userConfiguration.tags,
      userConfiguration.schedule,
      userConfiguration.lastRanAt,
      userConfiguration.countEasy,
      userConfiguration.countMedium,
      userConfiguration.countHard,
    ],
    transaction: true,
  });
  const rawConfig = queryResponse.rows?.[0] || null;
  return snakeCaseToCamelCaseObject(rawConfig);
};

const getAllUserConfigurations = async (
  pool: Pool,
  userId: number,
): Promise<UserConfiguration[]> => {
  const queryResponse = await executeQuery({
    pool,
    text: queryGetUserConfigurations,
    values: [userId],
    transaction: false,
  });
  const rawConfigs = queryResponse.rows || [];
  return rawConfigs.map(snakeCaseToCamelCaseObject);
};

const deleteUserConfiguration = async (
  pool: Pool,
  configurationId: number,
  userId: number,
): Promise<UserConfiguration | null> => {
  const queryResponse = await executeQuery({
    pool,
    text: queryDeleteUserConfiguration,
    values: [configurationId, userId],
    transaction: true,
  });
  const rawConfig = queryResponse.rows?.[0] || null;
  return snakeCaseToCamelCaseObject(rawConfig);
};

export {
  insertUserConfiguration,
  deleteUserConfiguration,
  getAllUserConfigurations,
};
