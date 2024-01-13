import { AppState } from '../types';

export class UtilityService {
  private static instance: UtilityService;
  private state: AppState;
  private constructor(state: AppState) {
    this.state = state;
  }

  public static getInstance(state: AppState): UtilityService {
    if (!UtilityService.instance) {
      UtilityService.instance = new UtilityService(state);
    }
    return UtilityService.instance;
  }

  public async clearCache(prefix: string) {
    const keys = await this.state.cache.keys(`${prefix}*`);
    await Promise.all(keys.map(async (key) => await this.state.cache.del(key)));
    return keys.length;
  }
}
