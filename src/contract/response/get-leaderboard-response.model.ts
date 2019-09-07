import { User } from '../models/user.model';

export class GetLeaderboardResponse {
  constructor(public users: User[]) {}
}
