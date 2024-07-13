import { Pool } from 'pg';
import { executeQuery } from '.';
import { Problem, PROBLEM_DIFFICULTY, PROBLEM_STATUS, Tag } from '../types';
import { snakeCaseToCamelCaseObject } from '../utils';

const queryInsertProblem = `
    insert into problems
    (source, description, difficulty, title, status, created_at, updated_at)
    values ($1, $2, $3, $4, $5, now(), now())
    returning *;
`;

const queryInsertProblemTag = `
    insert into problems_tags
    (problem_id, tag_id)
    values ($1, $2);
`;

const querySelectTag = 'select * from tags';

const querySelectProblems = (
  tagsToFetchFrom: string[],
  difficultyLevelsToConsider: PROBLEM_DIFFICULTY[],
  userId: number | null,
) => {
  return `
    select 
    problems.id as "id", 
    source,
    description, 
    difficulty,
    status,
    title,
    string_agg(distinct tags.name, ',') tags_list,
    count(distinct comments.id) total_comments,
    problems.created_at,
    problems.updated_at 
    from
    problems 
    join problems_tags
    on problems_tags.problem_id = problems.id
    join tags
    on problems_tags.tag_id = tags.id
    left join comments
    on comments.problem_id = problems.id
    where problems.status = '${PROBLEM_STATUS.APPROVED}'
    ${tagsToFetchFrom.length ? 'and tags.name = ANY($3)' : ''}
    ${
      difficultyLevelsToConsider.length
        ? `and difficulty in
        (${difficultyLevelsToConsider
          .map((difficulty) => `'${difficulty}'`)
          .join(', ')})
      `
        : ''
    }
    ${userId ? `and problems.id in (select problem_id from user_bookmarks where user_id = ${userId})` : ''}
    group by problems.id
    order by total_comments desc, problems.created_at desc
    limit $1 offset $2;
  `;
};

const queryGetLatestDigestProblems = `
    select
        p.id as "id",
        p.source,
        p.description,
        p.difficulty,
        p.status,
        p.title,
        p.created_at,
        p.updated_at
    from problems p
    join digests_problems dp on dp.problem_id = p.id
    join digests d on d.id = dp.digest_id
    where d.id = (
        select id
        from digests
        where configuration_id = $1
        order by created_at desc
        limit 1
    );
`;

const querySelectProblem = `
  select 
  problems.id as "id", 
  source,
  description, 
  difficulty,
  title,
  string_agg(distinct tags.name, ',') tags_list,
  count(distinct comments.id) total_comments,
  problems.created_at,
  problems.updated_at 
  from
  problems 
  join problems_tags
  on problems_tags.problem_id = problems.id
  join tags
  on problems_tags.tag_id = tags.id
  left join comments
  on comments.problem_id = problems.id
  where problems.id = $1
  group by problems.id;
`;

const queryInsertUserBookmark = `
  insert into user_bookmarks
  (user_id, problem_id, created_at)
  values ($1, $2, now());
`;

const queryDeletetUserBookmark = `
  delete from user_bookmarks
  where user_id = $1 and problem_id = $2;
`;

const queryCheckUserBookmark = `
  select exists
  (select 1 from user_bookmarks
  where user_id = $1 AND problem_id = $2)
`;

const querySelectProblemCount = (
  tagsToFetchFrom: string[],
  difficultyLevelsToConsider: PROBLEM_DIFFICULTY[],
  userId: number | null,
) => {
  return `
    select count(1) as count from 
    (
      select problems.id from
      problems 
      join problems_tags
      on problems_tags.problem_id = problems.id
      join tags
      on problems_tags.tag_id = tags.id
      left join comments
      on comments.problem_id = problems.id
      where problems.status = '${PROBLEM_STATUS.APPROVED}'
      ${tagsToFetchFrom.length ? 'and tags.name = ANY($1)' : ''}
      ${
        difficultyLevelsToConsider.length
          ? `and difficulty in
          (${difficultyLevelsToConsider
            .map((difficulty) => `'${difficulty}'`)
            .join(', ')})
        `
          : ''
      }
      ${userId ? `and problems.id in (select problem_id from user_bookmarks where user_id = ${userId})` : ''}
      group by problems.id
      order by problems.created_at desc
    ) sub_query;
  `;
};

const insertProblem = async (
  pool: Pool,
  problem: Partial<Problem>,
): Promise<Problem> => {
  const queryResponse = await executeQuery({
    pool,
    text: queryInsertProblem,
    values: [
      problem.source,
      problem.description,
      problem.difficulty,
      problem.title,
      problem.status,
    ],
    transaction: true,
  });
  const rawUser = queryResponse.rows?.[0] || null;
  return snakeCaseToCamelCaseObject(rawUser);
};

const insertProblemTag = async (
  pool: Pool,
  problemId: number,
  tagId: number,
) => {
  await executeQuery({
    pool,
    text: queryInsertProblemTag,
    values: [problemId, tagId],
    transaction: true,
  });
};

const getTags = async (pool: Pool): Promise<Tag[]> => {
  const queryResponse = await executeQuery({
    pool,
    text: querySelectTag,
    values: [],
  });
  const rawTags = queryResponse.rows || null;
  return rawTags;
};

const getProblems = async (
  pool: Pool,
  limit: number,
  offset: number,
  tagsToFetchFrom: string[],
  difficultyLevelsToConsider: PROBLEM_DIFFICULTY[],
  userId: number | null,
): Promise<Problem[]> => {
  const queryResponse = await executeQuery({
    pool,
    text: querySelectProblems(
      tagsToFetchFrom,
      difficultyLevelsToConsider,
      userId,
    ),
    values: tagsToFetchFrom.length
      ? [limit, offset, tagsToFetchFrom]
      : [limit, offset],
  });
  const rawProblems = queryResponse.rows || null;
  return rawProblems.map((problem) => {
    const obj = snakeCaseToCamelCaseObject(problem);
    return {
      ...obj,
      tags: problem.tags_list.split(','),
      totalComments: Number(obj.totalComments),
    };
  });
};

const getProblem = async (pool: Pool, problemId: number): Promise<Problem> => {
  const queryResponse = await executeQuery({
    pool,
    text: querySelectProblem,
    values: [problemId],
  });
  const rawProblems = queryResponse.rows || null;
  const obj = snakeCaseToCamelCaseObject(rawProblems[0]);
  return {
    ...obj,
    tags: rawProblems[0].tags_list.split(','),
    totalComments: Number(obj.totalComments),
  };
};

const getProblemCount = async (
  pool: Pool,
  tagsToFetchFrom: string[],
  difficultyLevelsToConsider: PROBLEM_DIFFICULTY[],
  userId: number | null,
) => {
  const queryResponse = await executeQuery({
    pool,
    text: querySelectProblemCount(
      tagsToFetchFrom,
      difficultyLevelsToConsider,
      userId,
    ),
    values: tagsToFetchFrom.length ? [tagsToFetchFrom] : [],
  });
  const raw = queryResponse.rows || null;
  return Number(raw?.[0]?.count);
};

const insertUserBookmark = async (
  pool: Pool,
  userId: number,
  problemId: number,
) => {
  await executeQuery({
    pool,
    text: queryInsertUserBookmark,
    values: [userId, problemId],
    transaction: true,
  });
};

const deleteUserBookmark = async (
  pool: Pool,
  userId: number,
  problemId: number,
) => {
  await executeQuery({
    pool,
    text: queryDeletetUserBookmark,
    values: [userId, problemId],
    transaction: true,
  });
};

const checkUserBookmark = async (
  pool: Pool,
  userId: number,
  problemId: number,
): Promise<boolean> => {
  const queryResponse = await executeQuery({
    pool,
    text: queryCheckUserBookmark,
    values: [userId, problemId],
  });
  return queryResponse.rows[0].exists;
};

const getLatestDigestProblems = async (
  pool: Pool,
  configurationId: number,
): Promise<Problem[]> => {
  const queryResponse = await executeQuery({
    pool,
    text: queryGetLatestDigestProblems,
    values: [configurationId],
    transaction: false,
  });
  const rawProblems = queryResponse.rows || [];
  return rawProblems.map(snakeCaseToCamelCaseObject);
};

export {
  insertProblem,
  insertProblemTag,
  insertUserBookmark,
  getTags,
  getProblem,
  getProblems,
  getProblemCount,
  deleteUserBookmark,
  checkUserBookmark,
  getLatestDigestProblems,
};
