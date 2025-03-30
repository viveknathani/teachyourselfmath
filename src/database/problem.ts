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

const querySelectDraftProblemIds = `select id from problems where status = '${PROBLEM_STATUS.DRAFT}' order by id asc;`;

const querySelectProblems = (
  tagsToFetchFrom: string[],
  difficultyLevelsToConsider: PROBLEM_DIFFICULTY[],
  userId: number | null,
) => {
  return `
    select
    problems.id as "id",
    '' as source,
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
    order by id asc
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
    '' as source,
    description,
    difficulty,
    title,
    nullif(string_agg(distinct tags.name, ','), '') as tags_list,
    count(distinct comments.id) as total_comments,
    problems.created_at,
    problems.updated_at
  from
    problems
  left join problems_tags
    on problems_tags.problem_id = problems.id
  left join tags
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
      order by id asc
    ) sub_query;
  `;
};

const querySearchProblems = `
  select
    problems.id as "id",
    '' as source,
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
  where
    problems.status = '${PROBLEM_STATUS.APPROVED}'
    and (lower(title) like lower($1) or lower(description) like lower($1))
  group by problems.id
  order by id asc;
`;

const queryUpdateProblem =
  'update problems set title = $2, description = $3, difficulty = $4, status = $5, updated_at = now() where id = $1';

const queryDeleteExistingProblemTags =
  'delete from problems_tags where problem_id = $1';

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
    tags: rawProblems[0]?.tags_list?.split(',') || [],
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

const getDraftProblemIds = async (pool: Pool): Promise<number[]> => {
  const queryResponse = await executeQuery({
    pool,
    text: querySelectDraftProblemIds,
    values: [],
    transaction: false,
  });
  const rawProblems = queryResponse.rows || [];
  return rawProblems.map((problem) => problem.id);
};

const updateProblem = async (
  pool: Pool,
  problemId: number,
  title: string,
  description: string,
  difficulty: PROBLEM_DIFFICULTY,
  status: PROBLEM_STATUS,
): Promise<void> => {
  await executeQuery({
    pool,
    text: queryUpdateProblem,
    values: [problemId, title, description, difficulty, status],
    transaction: false,
  });
};

const searchProblems = async (
  pool: Pool,
  query: string,
): Promise<Problem[]> => {
  const searchPattern = `%${query}%`;
  const queryResponse = await executeQuery({
    pool,
    text: querySearchProblems,
    values: [searchPattern],
  });
  return queryResponse.rows.map((row) => {
    const problem = snakeCaseToCamelCaseObject(row);
    if (row.tags_list) {
      problem.tags = row.tags_list.split(',');
    }
    return problem;
  });
};

const deleteExistingProblemTags = async (pool: Pool, problemId: number) => {
  await executeQuery({
    pool,
    text: queryDeleteExistingProblemTags,
    values: [problemId],
    transaction: false,
  });
};

const queryGetRandomProblems = `
  with ranked_problems as (
    select
      problems.*,
      string_agg(distinct tags.name, ',') as tags_list,
      row_number() over (partition by problems.difficulty order by random()) as rn
    from problems
    join problems_tags on problems_tags.problem_id = problems.id
    join tags on problems_tags.tag_id = tags.id
    where
      problems.status = $1
      and problems.difficulty = $2
      and tags.name = $3
    group by problems.id
  )
  select
    id,
    source,
    description,
    difficulty,
    status,
    title,
    tags_list,
    created_at,
    updated_at
  from ranked_problems
  where rn <= $4;
`;

const getRandomProblems = async (
  pool: Pool,
  difficulty: PROBLEM_DIFFICULTY,
  subject: string,
  count: number,
): Promise<Problem[]> => {
  const result = await executeQuery({
    pool,
    text: queryGetRandomProblems,
    values: [PROBLEM_STATUS.APPROVED, difficulty, subject, count],
    transaction: false,
  });
  return result.rows.map((row) => snakeCaseToCamelCaseObject(row));
};

export {
  insertProblem,
  insertProblemTag,
  insertUserBookmark,
  searchProblems,
  getTags,
  getProblem,
  getProblems,
  getProblemCount,
  deleteUserBookmark,
  checkUserBookmark,
  getLatestDigestProblems,
  getDraftProblemIds,
  updateProblem,
  deleteExistingProblemTags,
  getRandomProblems,
};
