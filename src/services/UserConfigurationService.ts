import {
  AppState,
  CreateConfigurationRequest,
  CreateConfigurationResponse,
  DIGEST_STATUS,
  PROBLEM_DIFFICULTY,
} from '../types';
import * as database from '../database';
import { isValidUserConfiguration } from '../validations';
import { TagService } from './TagService';
import { DataValidationError } from './errors';
import {
  addToGenerateProblemsQueue,
  getGenerateProblemsJobId,
} from '../queues/workers/generateProblems';
import { queue as GenerateProblemsQueue } from '../queues/workers/generateProblems';

export class UserConfigurationService {
  private static instance: UserConfigurationService;
  private state: AppState;
  private constructor(state: AppState) {
    this.state = state;
  }

  public static getInstance(state: AppState): UserConfigurationService {
    if (!UserConfigurationService.instance) {
      UserConfigurationService.instance = new UserConfigurationService(state);
    }
    return UserConfigurationService.instance;
  }

  public async getConfigurationByIdAndUserId(
    configurationId: number,
    userId: number,
  ) {
    return database.getConfigurationByIdAndUserId(
      this.state.databasePool,
      configurationId,
      userId,
    );
  }

  public async getDigestProblems(
    tags: string[],
    difficulty: PROBLEM_DIFFICULTY,
    configurationId: number,
    problemCount: number,
  ) {
    return database.getDigestProblems(
      this.state.databasePool,
      difficulty,
      tags,
      configurationId,
      problemCount,
    );
  }

  public async createConfiguration(
    userId: number,
    request: CreateConfigurationRequest,
  ): Promise<CreateConfigurationResponse> {
    const tagsService = TagService.getInstance(this.state);
    const tagsObject = await tagsService.getTags();

    const validation = isValidUserConfiguration(
      request,
      Object.keys(tagsObject),
    );
    if (!validation.ok) {
      throw new DataValidationError(
        'invalid configuration!',
        validation.issues,
      );
    }

    const insertedConfiguration = await database.insertUserConfiguration(
      this.state.databasePool,
      {
        ...request,
        userId,
      },
    );

    await addToGenerateProblemsQueue(
      {
        userId: insertedConfiguration.userId,
        configurationId: insertedConfiguration.id,
      },
      {
        repeat: {
          pattern: insertedConfiguration.schedule,
        },
        jobId: getGenerateProblemsJobId(
          insertedConfiguration.id,
          insertedConfiguration.userId,
        ),
      },
    );

    return {
      configuration: insertedConfiguration,
    };
  }

  public async getAllConfigurations(userId: number) {
    return database.getAllUserConfigurations(this.state.databasePool, userId);
  }

  public async getLatestDigestProblems(configurationId: number) {
    return database.getLatestDigestProblems(
      this.state.databasePool,
      configurationId,
    );
  }

  public async deleteConfiguration(userId: number, configurationId: number) {
    const result = await database.deleteUserConfiguration(
      this.state.databasePool,
      configurationId,
      userId,
    );
    return result;
  }

  public async bootstrap(): Promise<string> {
    const totalJobs = await GenerateProblemsQueue.count();
    if (totalJobs === 0) {
      const configurations = await database.getAllConfigurations(
        this.state.databasePool,
      );
      await Promise.all(
        configurations.map(async (configuration) => {
          await addToGenerateProblemsQueue(
            {
              userId: configuration.userId,
              configurationId: configuration.id,
            },
            {
              jobId: getGenerateProblemsJobId(
                configuration.id,
                configuration.userId,
              ),
              repeat: {
                pattern: configuration.schedule,
              },
            },
          );
        }),
      );
      return 'added to queue!';
    }

    return 'nothing to add!';
  }

  public async createDigest(configurationId: number) {
    return database.createDigest(
      this.state.databasePool,
      configurationId,
      DIGEST_STATUS.PREPARED,
    );
  }

  public async storeProblems(
    digestId: number,
    configurationId: number,
    problemIds: number[],
  ) {
    return database.addProblemsToDigest(
      this.state.databasePool,
      digestId,
      configurationId,
      problemIds,
    );
  }
}
