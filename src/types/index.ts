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
  description: PROBLEM_DIFFICULTY;
  difficulty: number;
  title: string;
  tags?: Tag[];
  tagsToAttachWhileInserting?: string[];
  createdAt: Date;
  updatedAt: Date;
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

export {
  ApiResponse,
  ExecuteQuery,
  AppState,
  User,
  Tag,
  Problem,
  SignupRequest,
  LoginRequest,
  LoginResponse,
  HTTP_CODE,
  SERVER_ENVIRONMENT,
};
