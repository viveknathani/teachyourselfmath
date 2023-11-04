import { Pool } from 'pg';
import { executeQuery } from '.';
import { Comment } from '../types';
import { snakeCaseToCamelCaseObject } from '../utils';

const queryInsertComment = `
    insert into comments
    (content, user_id, problem_id, parent_id, created_at, updated_at)
    values ($1, $2, $3, $4, now(), now())
    returning *;
`;

const querySelectCommentsByProblem = `
    select * from comments
    where problem_id = $1 and parent_id is null;
`;

const querySelectCommentsByProblemAndParent = `
    select * from comments
    where problem_id = $1 and parent_id = $2;
`;

const insertComment = async (pool: Pool, comment: Partial<Comment>) => {
  const queryResponse = await executeQuery({
    pool,
    text: queryInsertComment,
    values: [
      comment.content,
      comment.userId,
      comment.problemId,
      comment.parentId,
    ],
  });
  const rawComment = queryResponse.rows?.[0] || null;
  return snakeCaseToCamelCaseObject(rawComment);
};

const getCommentsByProblem = async (pool: Pool, problemId: number) => {
  const queryResponse = await executeQuery({
    pool,
    text: querySelectCommentsByProblem,
    values: [problemId],
  });
  const rawComments = queryResponse.rows;
  return rawComments.map((comment: any) => snakeCaseToCamelCaseObject(comment));
};

const getCommentsByProblemAndParent = async (
  pool: Pool,
  problemId: number,
  parentId: number,
) => {
  const queryResponse = await executeQuery({
    pool,
    text: querySelectCommentsByProblemAndParent,
    values: [problemId, parentId],
  });
  const rawComments = queryResponse.rows;
  return rawComments.map((comment: any) => snakeCaseToCamelCaseObject(comment));
};

export { insertComment, getCommentsByProblem, getCommentsByProblemAndParent };
