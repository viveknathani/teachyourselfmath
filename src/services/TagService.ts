import { AppState, Tag } from '../types';
import * as database from '../database';

export class TagService {
  private static instance: TagService;
  private state: AppState;
  private constructor(state: AppState) {
    this.state = state;
  }

  public static getInstance(state: AppState): TagService {
    if (!TagService.instance) {
      TagService.instance = new TagService(state);
    }
    return TagService.instance;
  }

  public async getTags(): Promise<Record<string, Tag>> {
    const result: Record<string, Tag> = {};
    const allTags = await database.getTags(this.state.databasePool);
    allTags.forEach((tag) => {
      result[tag.name] = tag;
    });
    return result;
  }
}
