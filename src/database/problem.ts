import { Pool } from 'pg';
import { executeQuery } from '.';
import { Problem, Tag } from '../types';
import { snakeCaseToCamelCaseObject } from '../utils';

const queryInsertProblem = `
    insert into problems
    (source, description, difficulty, title, created_at, updated_at)
    values ($1, $2, $3, $4, now(), now())
    returning *;
`;

const queryInsertProblemTag = `
    insert into problems_tags
    (problem_id, tag_id)
    values ($1, $2);
`;

const querySelectTag = 'select * from tags';

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

export { insertProblem, insertProblemTag, getTags };
