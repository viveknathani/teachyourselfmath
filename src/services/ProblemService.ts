import {
  AppState,
  GetProblemsRequest,
  GetProblemsResponse,
  PROBLEM_DIFFICULTY,
  Problem,
  ProduceProblemSetRequest,
  REDIS_KEY_PREFIX,
  SearchProblemsResponse,
} from '../types';
import * as errors from './errors';
import * as database from '../database';
import { TagService } from './TagService';
import { getPaginationConfig, TIME_IN_SECONDS } from '../utils';
import { DataValidationError } from './errors';

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
    userId: number | null,
    request: GetProblemsRequest,
  ): Promise<GetProblemsResponse> {
    const cacheKey =
      userId && request.bookmarked
        ? `PROBLEMS:${userId}:${JSON.stringify(request)}`
        : `PROBLEMS:${JSON.stringify(request)}`;
    const cachedData = await this.state.cache.get(cacheKey);
    let result: any = JSON.parse(cachedData || '{}');
    if (!cachedData) {
      result = await this.getProblemsFromDb(userId, request);
      await this.state.cache.setex(
        cacheKey,
        TIME_IN_SECONDS.ONE_HOUR,
        JSON.stringify(result),
      );
    }
    if (userId && request.bookmarked) {
      await this.addToKeyOfKeys(this.getUserSpecificKey(userId), cacheKey);
    }
    return result;
  }

  public async getProblemsFromDb(
    userId: number | null,
    request: GetProblemsRequest,
  ): Promise<GetProblemsResponse> {
    if (request.bookmarked && userId === null) {
      throw new errors.ErrUserNotFound();
    }
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
      userId && request.bookmarked ? userId : null,
    );
    const problems = await database.getProblems(
      this.state.databasePool,
      limit,
      offset,
      tagsToFetchFrom,
      difficultyLevelsToConsider,
      userId && request.bookmarked ? userId : null,
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

  public async bookmarkProblem(userId: number, problemId: number) {
    const key = this.getUserSpecificKey(userId);
    await this.deleteKeysForKeyOfKeys(key);
    await this.removeKeyOfKeys(key);
    return database.insertUserBookmark(
      this.state.databasePool,
      userId,
      problemId,
    );
  }

  public async unbookmarkProblem(userId: number, problemId: number) {
    const key = this.getUserSpecificKey(userId);
    await this.deleteKeysForKeyOfKeys(key);
    await this.removeKeyOfKeys(key);
    return database.deleteUserBookmark(
      this.state.databasePool,
      userId,
      problemId,
    );
  }

  public async isProblemBookmarkedByUser(
    userId: number,
    problemId: number,
  ): Promise<{
    isBookmarked: boolean;
  }> {
    const isBookmarked = await database.checkUserBookmark(
      this.state.databasePool,
      userId,
      problemId,
    );
    return {
      isBookmarked,
    };
  }

  private sanitizeSearchQuery(query: string): string {
    // Remove any potentially harmful characters and limit length
    return query
      .replace(/[^a-zA-Z0-9\s-_.,?!]/g, '')
      .trim()
      .slice(0, 100);
  }

  public async searchProblems(query: string): Promise<SearchProblemsResponse> {
    const sanitizedQuery = this.sanitizeSearchQuery(query);
    if (!sanitizedQuery) {
      return {
        problems: [],
        query: query,
        count: 0,
      };
    }

    const cacheKey = `PROBLEMS:SEARCH:${sanitizedQuery}`;
    const cachedData = await this.state.cache.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const problems = await database.searchProblems(
      this.state.databasePool,
      sanitizedQuery,
    );

    const result = {
      problems,
      query,
      count: problems.length,
    };

    await this.state.cache.setex(
      cacheKey,
      TIME_IN_SECONDS.ONE_HOUR,
      JSON.stringify(result),
    );

    return result;
  }

  public async updateProblem(problem: Partial<Problem>): Promise<void> {
    if (
      !problem.id ||
      !problem.title ||
      !problem.description ||
      !problem.difficulty ||
      !problem.status
    ) {
      throw new DataValidationError(
        'problem requires id, title, description, difficulty',
      );
    }

    // update main content
    await database.updateProblem(
      this.state.databasePool,
      problem.id,
      problem.title,
      problem.description,
      problem.difficulty,
      problem.status,
    );

    // remove old tags
    await database.deleteExistingProblemTags(
      this.state.databasePool,
      problem.id,
    );

    // add new tags
    const tagService = TagService.getInstance(this.state);
    const tagsMap = await tagService.getTags();
    problem.tagsToAttachWhileInserting?.forEach(async (tag) => {
      if (tagsMap[tag]) {
        await database.insertProblemTag(
          this.state.databasePool,
          problem.id!,
          tagsMap[tag].id,
        );
      }
    });
  }

  public async produceProblems(
    request: ProduceProblemSetRequest,
  ): Promise<Problem[]> {
    const { problemRequests, maxProblems = 30 } = request;

    if (!problemRequests || !Array.isArray(problemRequests)) {
      throw new DataValidationError('problemRequests must be an array');
    }

    if (problemRequests.length === 0) {
      throw new DataValidationError('problemRequests cannot be empty');
    }

    const totalProblems = problemRequests.reduce((acc, p) => acc + p.count, 0);
    if (totalProblems > maxProblems) {
      throw new DataValidationError(
        `total problems cannot exceed ${maxProblems}`,
      );
    }

    const allProblems: Problem[] = [];
    for (const problemRequest of problemRequests) {
      const difficulty =
        problemRequest.difficulty.toUpperCase() as PROBLEM_DIFFICULTY;

      if (!Object.values(PROBLEM_DIFFICULTY).includes(difficulty)) {
        throw new DataValidationError(
          `invalid difficulty: ${problemRequest.difficulty}. must be one of: ${Object.values(PROBLEM_DIFFICULTY).join(', ')}`,
        );
      }

      const randomProblems = await database.getRandomProblems(
        this.state.databasePool,
        difficulty,
        problemRequest.subject,
        problemRequest.count,
      );

      if (randomProblems.length < problemRequest.count) {
        throw new DataValidationError(
          `not enough ${difficulty} problems found for subject: ${problemRequest.subject}. requested ${problemRequest.count}, found ${randomProblems.length}`,
        );
      }

      allProblems.push(...randomProblems);
    }

    return allProblems;
  }

  public async getDraftProblemIds(): Promise<number[]> {
    const ids = await database.getDraftProblemIds(this.state.databasePool);
    return ids;
  }

  private async addToKeyOfKeys(keyOfKeys: string, key: string) {
    await this.state.cache.sadd(keyOfKeys, key);
  }

  private async removeKeyOfKeys(keyOfKeys: string) {
    await this.state.cache.del(keyOfKeys);
  }

  private async listKeysForKey(keyOfKeys: string): Promise<string[]> {
    return this.state.cache.smembers(keyOfKeys);
  }

  private async deleteKeysForKeyOfKeys(keyOfKeys: string) {
    const keys = await this.listKeysForKey(keyOfKeys);
    await Promise.all(keys.map(async (key) => await this.state.cache.del(key)));
  }

  private getUserSpecificKey(userId: number) {
    return `${REDIS_KEY_PREFIX.USER_SPECIFIC}:${userId}`;
  }
}
