/**
 * Test loadSouthFrancigena - run with: node scripts/test-south-francigena.mjs
 */
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

async function test() {
  const filePath = path.join(projectRoot, 'public', 'mappe', 'loreto-full.gpx');
  console.log('File exists:', await import('fs').then((fs) => fs.promises.access(filePath).then(() => true).catch(() => false)));
  
  const content = await readFile(filePath, 'utf-8');
  console.log('File size:', content.length, 'chars');
  console.log('First 200 chars:', content.slice(0, 200));
  
  // Check for trk/name
  const trkMatches = content.match(/<name>([^<]+)<\/name>/g);
  console.log('Name tags found:', trkMatches?.length);
  
  const bariLeucaNames = [
    '32 Bari - Mola di Bari',
    '33 Mola di Bari - Monopoli',
    'Tappa 43 - Da Otranto a Vignacastrisi',
  ];
  for (const name of bariLeucaNames) {
    const found = content.includes(`<name>${name}</name>`);
    console.log(`  "${name}": ${found ? 'FOUND' : 'NOT FOUND'}`);
  }
}

test().catch(console.error);
