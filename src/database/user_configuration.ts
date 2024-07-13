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

export { insertUserConfiguration };
