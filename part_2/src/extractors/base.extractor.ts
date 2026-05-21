import { AdRepository } from '../repositories';

export abstract class BaseExtractor {
  protected platformName: string;

  constructor(
    platformName: string,
    protected repository: AdRepository,
  ) {
    this.platformName = platformName;
  }

  abstract extractData(startDate: string, endDate: string): Promise<void>;
}
