import { CityLeader } from '../models/city-leader.model';

export class GetCityLeaderboardResponse {
  constructor(public cities: CityLeader[]) {}
}
