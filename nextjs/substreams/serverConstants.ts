import fs from 'fs';
import path from 'path';
// Point it towards your actual spkg
export const SPKG = path.resolve(
  process.cwd(),
  'substreams',
  'spkgs',
  'transaction-counter-v0.1.0.spkg'
);
export const SPKG_BUFFER = fs.readFileSync(SPKG);
