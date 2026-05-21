import { GoogleReport } from './google-report.dto';

export interface GoogleResponse {
  reports: GoogleReport[];
  nextPageToken?: string;
}
