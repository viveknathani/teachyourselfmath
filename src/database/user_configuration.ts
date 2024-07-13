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

const queryGetAllConfigIdsAndUserIds = `
    select id, user_id, schedule
    from user_configurations;
`;

const queryGetUserConfigurationByIdAndUserId = `
    select *
    from user_configurations
    where id = $1 and user_id = $2;
`;

const queryDigestProblems = `
    select
        problems.id as "id"
    from problems
    join problems_tags
        on problems_tags.problem_id = problems.id
    join tags
        on problems_tags.tag_id = tags.id
    where difficulty = $1
        and tags.name = any($2)
        and problems.id not in (
            select problem_id
            from digests_problems
            where configuration_id = $3
        )
    group by problems.id
    order by problems.created_at asc
    limit $4;
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

const getAllConfigurations = async (
  pool: Pool,
): Promise<{ id: number; userId: number; schedule: string }[]> => {
  const queryResponse = await executeQuery({
    pool,
    text: queryGetAllConfigIdsAndUserIds,
    values: [],
    transaction: false,
  });
  const rawConfigData = queryResponse.rows || [];
  return rawConfigData.map((row) => ({
    id: row.id,
    userId: row.user_id,
    schedule: row.schedule,
  }));
};

const getConfigurationByIdAndUserId = async (
  pool: Pool,
  configurationId: number,
  userId: number,
): Promise<UserConfiguration | null> => {
  const queryResponse = await executeQuery({
    pool,
    text: queryGetUserConfigurationByIdAndUserId,
    values: [configurationId, userId],
    transaction: false,
  });
  const rawConfig = queryResponse.rows?.[0] || null;
  return rawConfig ? snakeCaseToCamelCaseObject(rawConfig) : null;
};

const getDigestProblems = async (
  pool: Pool,
  difficulty: string,
  tagValues: string[],
  configurationId: number,
  problemCount: number,
): Promise<number[]> => {
  const queryResponse = await executeQuery({
    pool,
    text: queryDigestProblems,
    values: [difficulty, tagValues, configurationId, problemCount],
    transaction: false,
  });
  const rawProblems = queryResponse.rows || [];
  return rawProblems.map((problem) => problem.id);
};

export {
  insertUserConfiguration,
  deleteUserConfiguration,
  getAllUserConfigurations,
  getAllConfigurations,
  getConfigurationByIdAndUserId,
  getDigestProblems,
};
