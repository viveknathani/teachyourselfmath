import { Pool } from 'pg';
import { executeQuery } from '.';
import { Vote } from '../types';
import { snakeCaseToCamelCaseObject } from '../utils';

const queryInsertVoteForProblem = `
  insert into votes_problems
  (user_id, problem_id, vote_type)
  values ($1, $2, $3)
  returning *;
`;

const queryInsertVoteForComment = `
  insert into votes_comments
  (user_id, comment_id, vote_type)
  values ($1, $2, $3)
  returning *;
`;

const insertVoteForProblem = async (pool: Pool, vote: Partial<Vote>) => {
  const queryResponse = await executeQuery({
    pool,
    text: queryInsertVoteForProblem,
    values: [vote.userId, vote.topicId, vote.voteType],
  });
  const rawVote = queryResponse.rows?.[0] || null;
  return snakeCaseToCamelCaseObject(rawVote);
};

const insertVoteForComment = async (pool: Pool, vote: Partial<Vote>) => {
  const queryResponse = await executeQuery({
    pool,
    text: queryInsertVoteForComment,
    values: [vote.userId, vote.topicId, vote.voteType],
  });
  const rawVote = queryResponse.rows?.[0] || null;
  return snakeCaseToCamelCaseObject(rawVote);
};

export { insertVoteForProblem, insertVoteForComment };
