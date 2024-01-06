import {
  AppState,
  GetProblemsRequest,
  GetProblemsResponse,
  Problem,
} from '../types';
import * as database from '../database';
import { TagService } from './TagService';
import { getPaginationConfig } from '../utils';

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
    const { limit, offset } = getPaginationConfig({
      page: request.page || 1,
      limit: 5,
    });
    const count = await database.getProblemCount(this.state.databasePool);
    const problems = await database.getProblems(
      this.state.databasePool,
      limit,
      offset,
    );
    return {
      totalCount: count,
      problems: problems,
      page: request.page || 1,
    };
  }
}
