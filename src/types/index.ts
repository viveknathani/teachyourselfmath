import { Redis } from 'ioredis';
import { Pool } from 'pg';

enum HTTP_CODE {
  OK = 200,
  CREATED = 201,
  CLIENT_ERROR = 400,
  UNAUTHORIZED = 401,
  SERVER_ERROR = 500,
}

enum SERVER_ENVIRONMENT {
  DEV = 'dev',
  PROD = 'prod',
}

enum PROBLEM_DIFFICULTY {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

enum VOTE_TYPE {
  UPVOTE = 'UPVOTE',
  DOWNVOTE = 'DOWNVOTE',
}

enum VOTE_TOPIC {
  PROBLEM = 'PROBLEM',
  COMMENT = 'COMMENT',
}

enum QUEUE_NAME {
  SPLIT_FILE = 'SPLIT_FILE',
  PREDICT_SEGMENT = 'PREDICT_SEGMENT',
  SPLIT_PREDICTION = 'SPLIT_PREDICTION',
  REMOVE_JUNK = 'REMOVE_JUNK',
  ADD_TO_DATABASE = 'ADD_TO_DATABASE',
}

interface ApiResponse {
  status: 'success' | 'error';
  data?: any;
  message?: string;
}

interface ExecuteQuery {
  pool: Pool;
  text: string;
  values?: any[];
  transaction?: boolean;
}

interface AppState {
  databasePool: Pool;
  cache: Redis;
}

interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Tag {
  id: number;
  name: string;
}

interface Problem {
  id: number;
  source: string;
  description: string;
  difficulty: PROBLEM_DIFFICULTY;
  title: string;
  tags?: string[];
  totalComments?: number;
  tagsToAttachWhileInserting?: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface Comment {
  id: number;
  content: string;
  userId: number;
  problemId: number;
  replyCount: number;
  parentId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Vote {
  id: number;
  userId: number;
  voteType: VOTE_TYPE;
  topicId: number;
  topic: VOTE_TOPIC;
}

interface SignupRequest {
  name: string;
  email: string;
  username: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  authToken: string;
}

interface GetCommentsRequest {
  problemId: number;
  parentId: number | null;
}

interface GetProblemsRequest {
  page?: number;
  tags?: string;
}

interface GetProblemsResponse {
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  problems: Problem[];
}

interface SplitFileJobData {
  file: Express.Multer.File;
  tags: string;
}

interface PredictSegmentJobData {
  source: string;
  file: Express.Multer.File;
  start: number;
  end: number;
  tags: string;
}

interface SplitPredictionJobData {
  source: string;
  text: string;
  tags: string;
}

interface RemoveJunkJobData {
  source: string;
  prediction: string;
  tags: string;
}

interface AddToDatabaseJobData {
  sanitisedPrediction: string;
  source: string;
  tags: string[];
}

export {
  ApiResponse,
  ExecuteQuery,
  AppState,
  User,
  Tag,
  Problem,
  Comment,
  Vote,
  SignupRequest,
  LoginRequest,
  LoginResponse,
  GetCommentsRequest,
  GetProblemsRequest,
  GetProblemsResponse,
  SplitFileJobData,
  PredictSegmentJobData,
  SplitPredictionJobData,
  RemoveJunkJobData,
  AddToDatabaseJobData,
  HTTP_CODE,
  SERVER_ENVIRONMENT,
  VOTE_TYPE,
  VOTE_TOPIC,
  QUEUE_NAME,
  PROBLEM_DIFFICULTY,
};
