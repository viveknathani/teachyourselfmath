import { AppState, HealthCheckResponse } from '../types';
import * as database from '../database';

export class HealthCheckService {
  private static instance: HealthCheckService;
  private state: AppState;
  private constructor(state: AppState) {
    this.state = state;
  }

  public static getInstance(state: AppState): HealthCheckService {
    if (!HealthCheckService.instance) {
      HealthCheckService.instance = new HealthCheckService(state);
    }
    return HealthCheckService.instance;
  }

  public async doHealthCheck() {
    // 1. create response object
    const result: HealthCheckResponse = {
      allGood: false,
      canConnectToCache: false,
      canConnectToDatabase: false,
    };

    // 2. Simulatenous, fail-safe checks
    const promises = await Promise.allSettled([
      (async () => {
        try {
          const version = await database.getDatabaseVersion(
            this.state.databasePool,
          );

          if (version.length === 1) {
            result.canConnectToDatabase = true;
          }
        } catch (err) {
          console.log(err);
          throw err;
        }
      })(),
      (async () => {
        try {
          const cachePingResponse = await this.state.cache.ping();
          if (cachePingResponse === 'PONG') {
            result.canConnectToCache = true;
          }
        } catch (err) {
          console.log(err);
          throw err;
        }
      })(),
    ]);

    const didEveryPromiseResolve = promises.every(
      (promise) => promise.status === 'fulfilled',
    );

    if (didEveryPromiseResolve) {
      result.allGood = true;
    }

    return result;
  }
}
