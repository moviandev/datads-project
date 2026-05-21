import 'dotenv/config';
import { AdImplementationRepository } from './repositories';
import { FacebookExtractor, GoogleExtractor, TiktokExtractor } from './extractors';

import { closeDb } from './db/database';

function getDateRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const endDate = now.toISOString().split('T')[0];

  const from = new Date(now);
  from.setDate(from.getDate() - 30);
  const startDate = from.toISOString().split('T')[0];

  return { startDate, endDate };
}

async function main(): Promise<void> {
  console.log('[Main] Starting extraction');

  const repository = new AdImplementationRepository();
  const { startDate, endDate } = getDateRange();

  console.log(`[Main] Date range: ${startDate} → ${endDate}`);

  const extractors = [
    new FacebookExtractor(repository),
    new GoogleExtractor(repository),
    new TiktokExtractor(repository),
  ];

  const results = await Promise.allSettled(
    extractors.map((ext) => ext.extractData(startDate, endDate)),
  );

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`[Main] Extractor ${index} failed: ${result.reason}`);
    }
  });

  closeDb();
  console.log('[Main] Done');
}

main().catch((error: Error) => {
  console.error('[Main] Fatal error:', error.message);
  process.exit(1);
});
