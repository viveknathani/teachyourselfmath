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

enum PROBLEM_STATUS {
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
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
  ADD_TO_DATABASE = 'ADD_TO_DATABASE',
  SEND_NOTIFICATION = 'SEND_NOTIFICATION',
  GENERATE_PROBLEMS = 'GENERATE_PROBLEMS',
  STORE_PROBLEMS = 'STORE_PROBLEMS',
}

enum NOTIFICATION_CHANNEL {
  EMAIL = 'EMAIL',
}

enum PASSWORD_RESET_STAGE {
  SEND_REQUEST = 'SEND_REQUEST',
  ENTER_CODE = 'ENTER_CODE',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
}

enum REDIS_KEY_PREFIX {
  PASSWORD_RESET = 'PASSWORD_RESET',
  EMAIL_LIMIT = 'EMAIL_LIMIT',
  USER_SPECIFIC = 'USER_SPECIFIC',
  IMAGES = 'IMAGES',
}

enum IMAGE_FORMAT {
  JPEG = 'jpeg',
  PNG = 'png',
}

enum DIGEST_STATUS {
  PREPARED = 'PREPARED',
  PUBLISHED = 'PUBLISHED',
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

interface UserPreference {
  notifications: {
    email: {
      transactional: boolean;
      promotional: boolean;
    };
  };
}

interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  password: string;
  preference: UserPreference | null;
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
  status: PROBLEM_STATUS;
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

interface UserConfiguration {
  id: number;
  userId: number;
  tags: string[];
  schedule: string;
  lastRanAt?: Date;
  countEasy: number;
  countMedium: number;
  countHard: number;
  createdAt: Date;
}

interface Digest {
  id: number;
  configurationId: number;
  status: DIGEST_STATUS;
  createdAt: Date;
}

interface DigestProblem {
  id: number;
  digestId: number;
  configurationId: number;
  problemId: number;
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
  difficulty?: string;
  bookmarked?: boolean;
}

interface PasswordResetSendRequestData {
  email: string;
}

interface PasswordResetEnterCodeData {
  email: string;
  code: string;
}

interface PasswordResetUpdatePasswordData {
  email: string;
  newPassword: string;
}

interface PasswordResetStatus {
  code: string;
  verified: boolean;
}

interface PasswordResetRequest {
  stage: PASSWORD_RESET_STAGE;
  data:
    | PasswordResetSendRequestData
    | PasswordResetEnterCodeData
    | PasswordResetUpdatePasswordData;
}

interface PassswordResetResponse {
  stage: PASSWORD_RESET_STAGE;
  message: string;
}

interface GetProblemsResponse {
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  problems: Problem[];
}

interface UpdateProfileRequest {
  name?: string;
}

interface UpdateProfileResponse {
  user: User;
}

interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface CreateConfigurationRequest {
  tags: string[];
  schedule: string;
  count_easy: number;
  count_medium: number;
  count_hard: number;
}

interface CreateConfigurationResponse {
  configuration: UserConfiguration;
}

interface GetDigestResponse {
  user: {
    name: string;
  };
  problems: Problem[];
}

interface SplitFileJobData {
  file: Express.Multer.File;
  tags: string;
}

interface PredictSegmentJobData {
  source: string;
  imageKey: string;
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
  description: string;
  difficulty: PROBLEM_DIFFICULTY;
  source: string;
  tags: string[];
}

interface GenerateProblemsJobData {
  userId: number;
  configurationId: number;
}

interface StoreProblemsJobData {
  userId: number;
  configurationId: number;
  problemIds: number[];
}

interface SendNotificationRequest {
  channel: NOTIFICATION_CHANNEL;
  user: {
    type: 'uuid' | 'email';
    data: string;
  };
  payload: {
    subject: string;
    body: string;
  };
}

interface HealthCheckResponse {
  allGood: boolean;
  canConnectToDatabase: boolean;
  canConnectToCache: boolean;
}

export {
  ApiResponse,
  ExecuteQuery,
  AppState,
  User,
  UserPreference,
  Tag,
  Problem,
  Comment,
  Vote,
  UserConfiguration,
  Digest,
  DigestProblem,
  SignupRequest,
  LoginRequest,
  LoginResponse,
  GetCommentsRequest,
  GetProblemsRequest,
  GetProblemsResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  UpdatePasswordRequest,
  SendNotificationRequest,
  PasswordResetRequest,
  PasswordResetSendRequestData,
  PasswordResetEnterCodeData,
  PasswordResetUpdatePasswordData,
  PasswordResetStatus,
  PassswordResetResponse,
  CreateConfigurationRequest,
  CreateConfigurationResponse,
  SplitFileJobData,
  PredictSegmentJobData,
  SplitPredictionJobData,
  GenerateProblemsJobData,
  RemoveJunkJobData,
  AddToDatabaseJobData,
  StoreProblemsJobData,
  HealthCheckResponse,
  GetDigestResponse,
  HTTP_CODE,
  SERVER_ENVIRONMENT,
  VOTE_TYPE,
  VOTE_TOPIC,
  QUEUE_NAME,
  PROBLEM_DIFFICULTY,
  PROBLEM_STATUS,
  NOTIFICATION_CHANNEL,
  PASSWORD_RESET_STAGE,
  REDIS_KEY_PREFIX,
  IMAGE_FORMAT,
  DIGEST_STATUS,
};
