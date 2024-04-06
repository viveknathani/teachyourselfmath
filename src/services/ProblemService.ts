import {
  AppState,
  GetProblemsRequest,
  GetProblemsResponse,
  PROBLEM_DIFFICULTY,
  Problem,
} from '../types';
import * as database from '../database';
import { TagService } from './TagService';
import { getPaginationConfig, TIME_IN_SECONDS } from '../utils';

export class ProblemService {
  private static instance: ProblemService;
  private state: AppState;
  private constructor(state: AppState) {
    this.state = state;
  }

  public static getInstance(state: AppState): ProblemService {
    if (!ProblemService.instance) {
      ProblemService.instance = new ProblemService(state);
    }
    return ProblemService.instance;
  }

  public async insertProblem(problem: Partial<Problem>) {
    const tagService = TagService.getInstance(this.state);
    const insertedProblem = await database.insertProblem(
      this.state.databasePool,
      problem,
    );
    const tagsMap = await tagService.getTags();
    problem.tagsToAttachWhileInserting?.forEach(async (tag) => {
      if (tagsMap[tag]) {
        await database.insertProblemTag(
          this.state.databasePool,
          insertedProblem.id,
          tagsMap[tag].id,
        );
      }
    });
    return insertedProblem;
  }

  public async insertProblems(problems: Partial<Problem>[]) {
    return Promise.allSettled(
      problems.map(async (problem) => {
        await this.insertProblem(problem);
      }),
    );
  }

  public async getProblems(
    request: GetProblemsRequest,
  ): Promise<GetProblemsResponse> {
    const cacheKey = `PROBLEMS:$${JSON.stringify(request)}`;
    const cachedData = await this.state.cache.get(cacheKey);
    let result: any = JSON.parse(cachedData || '{}');
    if (!cachedData) {
      result = await this.getProblemsFromDb(request);
      await this.state.cache.setex(
        cacheKey,
        TIME_IN_SECONDS.ONE_HOUR,
        JSON.stringify(result),
      );
    }
    return result;
  }

  public async getProblemsFromDb(
    request: GetProblemsRequest,
  ): Promise<GetProblemsResponse> {
    const PAGE_SIZE = 20;
    const { limit, offset } = getPaginationConfig({
      page: request.page || 1,
      limit: PAGE_SIZE,
    });
    const tagsToFetchFrom =
      (request.tags !== '' &&
        request.tags?.split(',').map((tag) => decodeURI(tag))) ||
      [];
    const difficultyLevelsToConsider = Array.from(
      new Set(
        (request.difficulty !== '' &&
          request.difficulty
            ?.split(',')
            .map(
              (difficulty) => decodeURI(difficulty) as PROBLEM_DIFFICULTY,
            )) ||
          [],
      ),
    );
    const count = await database.getProblemCount(
      this.state.databasePool,
      tagsToFetchFrom,
      difficultyLevelsToConsider,
    );
    const problems = await database.getProblems(
      this.state.databasePool,
      limit,
      offset,
      tagsToFetchFrom,
      difficultyLevelsToConsider,
    );
    const currentPage = Number(request.page || 1);
    return {
      totalCount: count,
      totalPages: Math.ceil(count / PAGE_SIZE),
      pageSize: PAGE_SIZE,
      currentPage,
      problems: problems,
    };
  }

  public async getProblem(problemId: number) {
    return database.getProblem(this.state.databasePool, problemId);
  }
}
