import { Pool } from 'pg';
import { executeQuery } from '.';
import { Comment } from '../types';
import { snakeCaseToCamelCaseObject } from '../utils';
import { getTimeAgo } from '../utils';

const queryInsertComment = `
    insert into comments
    (content, user_id, problem_id, parent_id, created_at, updated_at)
    values ($1, $2, $3, $4, now(), now())
    returning *;
`;

const querySelectCommentsByProblem = `
  select 
  parent_comments.*,
  users.username as author,
  replies.count as reply_count
  from comments 
  parent_comments
  cross join lateral (
    select count(*) count
    from comments replies
    where replies.parent_id = parent_comments.id
  ) replies
  join users on parent_comments.user_id = users.id
  where problem_id = $1 and parent_id is null
  order by parent_comments.created_at desc;
`;

const querySelectCommentsByProblemAndParent = `
    select comments.*,
    users.username as author 
    from comments
    join users on comments.user_id = users.id
    where problem_id = $1 and parent_id = $2
    order by comments.created_at desc;
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
  return rawComments.map((comment: any) => {
    const obj = snakeCaseToCamelCaseObject(comment);
    obj.timeAgo = getTimeAgo(obj.createdAt);
    return {
      ...obj,
      replyCount: Number(obj.replyCount),
    };
  });
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
  return rawComments.map((comment: any) => {
    const obj = snakeCaseToCamelCaseObject(comment);
    obj.timeAgo = getTimeAgo(obj.createdAt);
    return obj;
  });
};

export { insertComment, getCommentsByProblem, getCommentsByProblemAndParent };
