import * as fs from 'fs';
import * as path from 'path';

export async function countWebpImages(dir: string): Promise<number> {
  if (!fs.existsSync(dir)) return 0;

  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  let count = 0;

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      count += await countWebpImages(fullPath); 
    } else if (entry.isFile() && fullPath.endsWith('.webp')) {
      count++;
    }
  }
  return count;
}
