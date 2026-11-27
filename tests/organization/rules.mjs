// Pure rules for project organization. Each rule takes plain data and returns a list of
// problems as strings. An empty list means the rule passes.
// The rules are specified in docs/specs/project-organization.md.

export const ROOT_REQUIRED = [
  '.editorconfig',
  '.env.example',
  '.github',
  '.gitignore',
  '.nvmrc',
  'CLAUDE.md',
  'CONTRIBUTING.md',
  'README.md',
  'apps',
  'docker',
  'docs',
  'package.json',
  'scripts',
  'tests',
];

export const ROOT_OPTIONAL = ['.dockerignore', 'LICENSE', 'package-lock.json'];

export const APPS_ENTRIES = ['server', 'web'];

export const DOCS_ENTRIES = [
  'README.md',
  'adr',
  'development-workflow.md',
  'guidelines.md',
  'knowledge',
  'roadmap.md',
  'specs',
  'status.md',
];

export const ADR_SECTIONS = [
  'Status',
  'Context',
  'Decision',
  'Alternatives considered',
  'Consequences',
];

export const SPEC_SECTIONS = [
  'Purpose',
  'User story',
  'Goals',
  'Non-goals',
  'Requirements',
  'Acceptance criteria',
  'Open questions',
];

export const STATUS_SECTIONS = ['Current milestone', 'Completed', 'In progress', 'Next'];

export const ISSUE_TEMPLATES = {
  'user_story.md': {
    label: 'user-story',
    sections: ['Related spec', 'Story', 'Acceptance criteria', 'Testing requirements'],
  },
  'bug_report.md': {
    label: 'bug',
    sections: [
      'Related spec',
      'Steps to reproduce',
      'Expected behavior',
      'Actual behavior',
      'Acceptance criteria',
      'Testing requirements',
    ],
  },
  'feature_request.md': {
    label: 'enhancement',
    sections: ['Problem', 'Proposed solution', 'Related spec'],
  },
};

export const INSTRUCTION_MENTIONS = [
  'docs/specs/',
  'docs/adr/',
  'docs/knowledge/',
  'docs/status.md',
  'docs/guidelines.md',
  'GitHub Issues',
  'scripts/check.sh',
];

const REPOSITORY = 'bradreimer/floppy-schnauzer';
const KEBAB = '[a-z0-9]+(?:-[a-z0-9]+)*';
const KEBAB_MD = new RegExp(`^${KEBAB}\\.md$`);
const ADR_NAME = new RegExp(`^ADR-(\\d{3})-${KEBAB}\\.md$`);
const IMAGE_NAME = new RegExp(`^${KEBAB}\\.(svg|png|jpg|jpeg|webp)$`);
const ADR_STATUS = /^(Proposed|Accepted|Deprecated|Superseded by ADR-(\d{3}))$/;

/** Removes fenced code blocks so that examples aren't read as content. */
export function stripCodeBlocks(markdown) {
  const kept = [];
  let fence = null;
  for (const line of markdown.split('\n')) {
    const match = line.match(/^\s*(`{3,}|~{3,})/);
    if (fence === null && match) {
      fence = match[1][0];
    } else if (fence !== null && match && match[1][0] === fence) {
      fence = null;
    } else if (fence === null) {
      kept.push(line);
    }
  }
  return kept.join('\n');
}

/** Returns the text of every heading at the given level, outside code blocks. */
export function headings(markdown, level) {
  const prefix = '#'.repeat(level) + ' ';
  return stripCodeBlocks(markdown)
    .split('\n')
    .filter((line) => line.startsWith(prefix))
    .map((line) => line.slice(prefix.length).trim());
}

/** Returns the body lines under one level-2 heading, trimmed and without blank lines. */
export function sectionLines(markdown, title) {
  const lines = stripCodeBlocks(markdown).split('\n');
  const start = lines.indexOf(`## ${title}`);
  if (start === -1) return [];
  const body = [];
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith('## ')) break;
    if (line.trim() !== '') body.push(line.trim());
  }
  return body;
}

/** Returns the target of every inline link and image, outside code blocks and code spans. */
export function linkTargets(markdown) {
  const text = stripCodeBlocks(markdown).replace(/`[^`\n]*`/g, '');
  return [...text.matchAll(/!?\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)].map(
    (match) => match[1],
  );
}

/** Returns true for a link that points to a file in the repository. */
export function isRelativeLink(target) {
  return !/^([a-z][a-z0-9+.-]*:|#|\/\/)/i.test(target);
}

function sameList(actual, expected) {
  return actual.length === expected.length && actual.every((item, i) => item === expected[i]);
}

function checkSections(markdown, expected) {
  const actual = headings(markdown, 2);
  if (sameList(actual, expected)) return [];
  return [
    `sections must be exactly [${expected.join(', ')}] in that order, found [${actual.join(', ')}]`,
  ];
}

export function checkEntries(entries, required, optional, where) {
  const problems = [];
  for (const name of required) {
    if (!entries.includes(name)) problems.push(`${where}: required entry "${name}" is missing`);
  }
  for (const name of entries) {
    if (!required.includes(name) && !optional.includes(name)) {
      problems.push(`${where}: "${name}" isn't allowed here`);
    }
  }
  return problems;
}

export function checkAdr(fileName, markdown, allFileNames = [fileName]) {
  const name = fileName.match(ADR_NAME);
  if (!name) return ['name must look like ADR-001-short-title.md'];
  const problems = [];
  const title = markdown.split('\n')[0].match(/^# ADR-(\d{3}): \S.*$/);
  if (!title) {
    problems.push('first line must look like "# ADR-001: Title"');
  } else if (title[1] !== name[1]) {
    problems.push(`title number ${title[1]} doesn't match file number ${name[1]}`);
  }
  problems.push(...checkSections(markdown, ADR_SECTIONS));
  const status = sectionLines(markdown, 'Status');
  const parsed = status.length === 1 ? status[0].match(ADR_STATUS) : null;
  if (!parsed) {
    problems.push(
      'Status must be one line: Proposed, Accepted, Deprecated, or Superseded by ADR-NNN',
    );
  } else if (parsed[2] !== undefined) {
    if (parsed[2] === name[1]) problems.push("an ADR can't supersede itself");
    if (!allFileNames.some((other) => other.startsWith(`ADR-${parsed[2]}-`))) {
      problems.push(`superseding ADR-${parsed[2]} doesn't exist`);
    }
  }
  return problems;
}

export function adrStatus(markdown) {
  return sectionLines(markdown, 'Status')[0] ?? '';
}

export function checkAdrNumbering(fileNames) {
  const problems = [];
  const numbers = [];
  for (const fileName of fileNames) {
    const match = fileName.match(ADR_NAME);
    if (match) numbers.push(Number(match[1]));
  }
  numbers.sort((a, b) => a - b);
  numbers.forEach((number, index) => {
    if (number !== index + 1) {
      problems.push(
        `ADR numbers must run 001, 002, 003 with no gaps or duplicates: expected ${String(index + 1).padStart(3, '0')}, found ${String(number).padStart(3, '0')}`,
      );
    }
  });
  return problems.slice(0, 1);
}

export function checkSpec(fileName, markdown) {
  if (!KEBAB_MD.test(fileName)) return ['name must be lowercase with hyphens, like short-title.md'];
  const problems = [];
  const lines = markdown.split('\n');
  if (!/^# \S/.test(lines[0])) problems.push('first line must be "# Title"');
  const intro = stripCodeBlocks(markdown).split(/^## /m)[0];
  const tracking = intro.match(/^Tracking issue: \[#(\d+)\]\(([^)]+)\)\.?$/m);
  if (!tracking) {
    problems.push('a "Tracking issue: [#N](url)." line must come before the first section');
  } else if (tracking[2] !== `https://github.com/${REPOSITORY}/issues/${tracking[1]}`) {
    problems.push(`tracking issue must link to https://github.com/${REPOSITORY}/issues/${tracking[1]}`);
  }
  problems.push(...checkSections(markdown, SPEC_SECTIONS));
  return problems;
}

export function checkKnowledgeName(fileName) {
  return KEBAB_MD.test(fileName) ? [] : ['name must be lowercase with hyphens, like short-title.md'];
}

export function checkImageName(fileName) {
  return IMAGE_NAME.test(fileName)
    ? []
    : ['name must be lowercase with hyphens, and the type must be svg, png, jpg, jpeg, or webp'];
}

/** Checks that an index links to every document, and returns one problem per missing link. */
export function checkIndex(indexMarkdown, fileNames) {
  const targets = linkTargets(indexMarkdown).map((target) => target.replace(/^\.\//, ''));
  return fileNames
    .filter((fileName) => !targets.includes(fileName))
    .map((fileName) => `the index doesn't link to ${fileName}`);
}

export function checkIssueTemplate(fileName, markdown) {
  const rule = ISSUE_TEMPLATES[fileName];
  if (!rule) return [`unknown template, expected one of ${Object.keys(ISSUE_TEMPLATES).join(', ')}`];
  const problems = [];
  const frontMatter = markdown.match(/^---\n([\s\S]*?)\n---\n/);
  if (!frontMatter) return ['front matter is missing'];
  for (const key of ['name', 'about', 'title', 'labels']) {
    if (!new RegExp(`^${key}: \\S`, 'm').test(frontMatter[1])) {
      problems.push(`front matter needs "${key}"`);
    }
  }
  // GitHub's template editor writes `labels: bug`. A hand-written list is `labels: ["bug"]`.
  const labelsLine = frontMatter[1].match(/^labels:(.*)$/m);
  const labels = (labelsLine ? labelsLine[1] : '')
    .replace(/[[\]"']/g, '')
    .split(',')
    .map((label) => label.trim());
  if (!labels.includes(rule.label)) {
    problems.push(`front matter labels must include "${rule.label}"`);
  }
  const found = headings(markdown, 2);
  for (const section of rule.sections) {
    if (!found.includes(section)) problems.push(`section "${section}" is missing`);
  }
  return problems;
}

export function checkMentions(markdown, phrases) {
  return phrases
    .filter((phrase) => !markdown.includes(phrase))
    .map((phrase) => `must mention "${phrase}"`);
}

export function checkStatus(markdown) {
  const found = headings(markdown, 2);
  return STATUS_SECTIONS.filter((section) => !found.includes(section)).map(
    (section) => `section "${section}" is missing`,
  );
}

export const GUIDELINE_COUNT = 7;
export const GUIDELINE_PARTS = ['**Rule.**', '**Method.**', '**Enforced by.**'];

/** Each guideline is a numbered section that states its rule, its method, and its enforcement. */
export function checkGuidelines(markdown) {
  const problems = [];
  const sections = stripCodeBlocks(markdown).split(/^## /m).slice(1);
  if (sections.length !== GUIDELINE_COUNT) {
    problems.push(`expected ${GUIDELINE_COUNT} guidelines, found ${sections.length}`);
  }
  sections.forEach((section, index) => {
    const title = section.split('\n')[0];
    if (!title.startsWith(`${index + 1}. `)) {
      problems.push(`guideline "${title}" must be numbered ${index + 1}`);
    }
    for (const part of GUIDELINE_PARTS) {
      if (!section.includes(part)) problems.push(`guideline "${title}" must state ${part}`);
    }
  });
  return problems;
}

const SECRET_NAME = /KEY|SECRET|TOKEN|PASSWORD/;

/** .env.example lists NAME=value lines, and a secret variable has an empty value. */
export function checkEnvExample(text) {
  const problems = [];
  for (const line of text.split('\n')) {
    if (line.trim() === '' || line.startsWith('#')) continue;
    const match = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
    if (!match) {
      problems.push(`"${line}" must look like NAME=value`);
    } else if (SECRET_NAME.test(match[1]) && match[2] !== '') {
      problems.push(`${match[1]} holds a secret, so its value must be empty`);
    }
  }
  return problems;
}

export const README_SECTIONS = ['Play', 'Develop', 'Run in Docker', 'Configuration'];

/** The README has the required sections in order, and documents every variable in .env.example. */
export function checkReadme(readme, envExample) {
  const problems = [];
  const found = headings(readme, 2).filter((title) => README_SECTIONS.includes(title));
  if (!sameList(found, README_SECTIONS)) {
    problems.push(
      `sections must include [${README_SECTIONS.join(', ')}] in that order, found [${found.join(', ')}]`,
    );
  }
  const names = envExample
    .split('\n')
    .map((line) => line.match(/^#?\s*([A-Z][A-Z0-9_]*)=/)?.[1])
    .filter(Boolean);
  for (const name of names) {
    if (!readme.includes(`\`${name}\``)) problems.push(`variable ${name} isn't documented`);
  }
  return problems;
}

/**
 * The asset table in the art and audio assets spec lists every file in the assets folder, and
 * every file it lists exists. The table's first column holds each path in code format.
 */
export function checkAssetTable(specMarkdown, assetFiles) {
  const listed = [
    ...stripCodeBlocks(specMarkdown).matchAll(/^\|\s*`([^`]+\.(?:png|wav))`\s*\|/gm),
  ].map((match) => match[1]);
  const problems = [];
  for (const file of assetFiles) {
    if (!listed.includes(file)) problems.push(`${file} is in the assets folder but not in the table`);
  }
  for (const file of listed) {
    if (!assetFiles.includes(file)) problems.push(`${file} is in the table but not in the assets folder`);
  }
  return problems;
}

/** Returns the width and height of a PNG from its header, or null for a file that isn't a PNG. */
export function pngSize(bytes) {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length < 24 || !signature.every((byte, i) => bytes[i] === byte)) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return [view.getUint32(16), view.getUint32(20)];
}

/**
 * The Size column of each PNG row in the asset table, written "W × H", matches the file's real
 * size. `sizes` maps each PNG's path in the assets folder to its [width, height].
 */
export function checkAssetSizes(specMarkdown, sizes) {
  const problems = [];
  // Only the asset table section. The Prompts table below it also starts rows with a file name.
  const text = stripCodeBlocks(specMarkdown);
  const start = text.indexOf('### The asset table');
  const section = start === -1 ? text : text.slice(start).split(/\n### (?!The asset table)/)[0];
  const rows = section.matchAll(/^\|\s*`([^`]+\.png)`\s*\|\s*([^|]*?)\s*\|/gm);
  for (const [, file, size] of rows) {
    const actual = sizes[file];
    if (!actual) continue;
    const listed = size.match(/^(\d+) × (\d+)$/);
    if (!listed) {
      problems.push(`${file}: the size must look like "W × H", found "${size}"`);
    } else if (Number(listed[1]) !== actual[0] || Number(listed[2]) !== actual[1]) {
      problems.push(`${file}: the table says ${size}, but the file is ${actual[0]} × ${actual[1]}`);
    }
  }
  return problems;
}

/** Text files use LF line endings, have no trailing spaces, and end with exactly one newline. */
export function checkTextFormat(text) {
  const problems = [];
  if (text.includes('\r')) problems.push('uses CRLF line endings, expected LF');
  const lines = text.split('\n');
  const trailing = lines.findIndex((line) => /[ \t]+\r?$/.test(line));
  if (trailing !== -1) problems.push(`line ${trailing + 1} has trailing spaces`);
  if (text !== '' && !text.endsWith('\n')) problems.push('must end with a newline');
  if (text.endsWith('\n\n')) problems.push('must end with exactly one newline');
  return problems;
}

export const SERVER_CHECKS = ['dotnet format --verify-no-changes', 'dotnet build', 'dotnet test'];
export const WEB_CHECKS = [
  'npm run format:check',
  'npm run lint',
  'npm run typecheck',
  'npm test',
];

/** The check script runs the organization tests, plus the steps for each stack that exists. */
export function checkCheckScript(script, { hasServer, hasWeb }) {
  const problems = [];
  const lines = script.split('\n').filter((line) => !line.trim().startsWith('#'));
  const runs = (command) => lines.some((line) => line.includes(command));
  if (!runs('npm test')) problems.push('must run "npm test"');
  if (!runs('set -euo pipefail')) problems.push('must use "set -euo pipefail" so a failure stops it');
  if (hasServer) {
    for (const command of SERVER_CHECKS) {
      if (!runs(command)) problems.push(`apps/server exists, so it must run "${command}"`);
    }
  }
  if (hasWeb) {
    if (!runs('apps/web')) problems.push('apps/web exists, so it must run the checks in apps/web');
    for (const command of WEB_CHECKS.slice(0, 3)) {
      if (!runs(command)) problems.push(`apps/web exists, so it must run "${command}"`);
    }
  }
  return problems;
}

/** Every C# project in src has a test project of the same name with a .Tests suffix. */
export function checkTestProjects(sourceProjects, testProjects) {
  return sourceProjects
    .filter((name) => !testProjects.includes(`${name}.Tests`))
    .map((name) => `apps/server/src/${name} needs a test project at apps/server/tests/${name}.Tests`);
}
