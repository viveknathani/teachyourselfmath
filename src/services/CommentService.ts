import { AppState, Comment, GetCommentsRequest } from '../types';
import * as database from '../database';

export class CommentService {
  private static instance: CommentService;
  private state: AppState;
  private constructor(state: AppState) {
    this.state = state;
  }

  public static getInstance(state: AppState): CommentService {
    if (!CommentService.instance) {
      CommentService.instance = new CommentService(state);
    }
    return CommentService.instance;
  }

  public async insertComment(comment: Partial<Comment>) {
    return database.insertComment(this.state.databasePool, comment);
  }

  public async getComments(request: GetCommentsRequest) {
    if (request.parentId) {
      return database.getCommentsByProblemAndParent(
        this.state.databasePool,
        request.problemId,
        request.parentId,
      );
    }
    return database.getCommentsByProblem(
      this.state.databasePool,
      request.problemId,
    );
  }
}
