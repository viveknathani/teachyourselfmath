import { AppState, Vote, VOTE_TOPIC } from '../types';
import * as database from '../database';

export class VoteService {
  private static instance: VoteService;
  private state: AppState;
  private constructor(state: AppState) {
    this.state = state;
  }

  public static getInstance(state: AppState): VoteService {
    if (!VoteService.instance) {
      VoteService.instance = new VoteService(state);
    }
    return VoteService.instance;
  }

  public async insertVote(vote: Partial<Vote>) {
    switch (vote.topic) {
      case VOTE_TOPIC.PROBLEM: {
        return database.insertVoteForProblem(this.state.databasePool, vote);
      }
      case VOTE_TOPIC.COMMENT: {
        return database.insertVoteForComment(this.state.databasePool, vote);
      }
      default: {
        return {};
      }
    }
  }
}
