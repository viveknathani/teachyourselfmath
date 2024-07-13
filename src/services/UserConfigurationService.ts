import {
  AppState,
  CreateConfigurationRequest,
  CreateConfigurationResponse,
} from '../types';
import * as database from '../database';
import { isValidUserConfiguration } from '../validations';
import { TagService } from './TagService';
import { DataValidationError } from './errors';
import { addToGenerateProblemsQueue } from '../queues/workers/generateProblems';

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
      },
    );

    return {
      configuration: insertedConfiguration,
    };
  }

  public async deleteConfiguration(userId: number, configurationId: number) {
    const result = await database.deleteUserConfiguration(
      this.state.databasePool,
      configurationId,
      userId,
    );
    return result;
  }
}
