// Reads the repository for the organization tests. Only files that Git tracks, or would track,
// are checked, so ignored files such as node_modules never fail a test.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const listed = execFileSync(
  'git',
  ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
  { cwd: root, encoding: 'utf8' },
);
const deleted = new Set(
  execFileSync('git', ['ls-files', '--deleted', '-z'], { cwd: root, encoding: 'utf8' })
    .split('\0')
    .filter(Boolean),
);

/** Every file in the repository, as a path relative to the root with forward slashes. */
export const files = listed
  .split('\0')
  .filter((file) => file && !deleted.has(file))
  .sort();

export function read(file) {
  return readFileSync(path.join(root, file), 'utf8');
}

export function exists(file) {
  return files.includes(file);
}

/** The names of the files and folders directly inside a folder. Use '' for the root. */
export function entries(folder) {
  const prefix = folder === '' ? '' : `${folder}/`;
  const names = new Set();
  for (const file of files) {
    if (file.startsWith(prefix)) names.add(file.slice(prefix.length).split('/')[0]);
  }
  return [...names].sort();
}

/** The names of the files directly inside a folder, without subfolders. */
export function filesIn(folder) {
  const prefix = `${folder}/`;
  return files
    .filter((file) => file.startsWith(prefix) && !file.slice(prefix.length).includes('/'))
    .map((file) => file.slice(prefix.length));
}

/** The names of the subfolders directly inside a folder. */
export function foldersIn(folder) {
  const direct = filesIn(folder);
  return entries(folder).filter((name) => !direct.includes(name));
}
