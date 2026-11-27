// Applies the organization rules to this repository.
// The rules are specified in docs/specs/project-organization.md.

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { describe, it } from 'node:test';

import { entries, exists, files, filesIn, foldersIn, read, root } from './repo.mjs';
import {
  APPS_ENTRIES,
  DOCS_ENTRIES,
  INSTRUCTION_MENTIONS,
  ISSUE_TEMPLATES,
  ROOT_OPTIONAL,
  ROOT_REQUIRED,
  adrStatus,
  checkAdr,
  checkAssetTable,
  checkAdrNumbering,
  checkCheckScript,
  checkEntries,
  checkEnvExample,
  checkGuidelines,
  checkImageName,
  checkIndex,
  checkIssueTemplate,
  checkKnowledgeName,
  checkMentions,
  checkReadme,
  checkSpec,
  checkStatus,
  checkTestProjects,
  checkTextFormat,
  isRelativeLink,
  linkTargets,
} from './rules.mjs';

const FIX = 'See docs/specs/project-organization.md.';

function assertNoProblems(problems) {
  assert.deepEqual(problems, [], `\n${problems.join('\n')}\n${FIX}`);
}

function documentsIn(folder) {
  return filesIn(folder).filter((name) => name !== 'README.md');
}

describe('repository root', () => {
  it('holds only the allowed files and folders', () => {
    assertNoProblems(checkEntries(entries(''), ROOT_REQUIRED, ROOT_OPTIONAL, 'repository root'));
  });
});

describe('apps folder', () => {
  it('holds the server and the web app', () => {
    assertNoProblems(checkEntries(entries('apps'), APPS_ENTRIES, [], 'apps'));
  });

  it('has a test project for every C# project', () => {
    assertNoProblems(
      checkTestProjects(foldersIn('apps/server/src'), foldersIn('apps/server/tests')),
    );
  });
});

describe('secrets', () => {
  it('.env is not tracked, and Git ignores it', () => {
    const tracked = files.filter((file) => /(^|\/)\.env(\.(?!example$)[^/]+)?$/.test(file));
    assertNoProblems(tracked.map((file) => `${file}: never commit an env file that can hold secrets`));
    const ignored = spawnSync('git', ['check-ignore', '-q', '.env'], { cwd: root });
    assert.equal(ignored.status, 0, '.gitignore must ignore .env');
  });

  it('.env.example holds no secret values', () => {
    assertNoProblems(checkEnvExample(read('.env.example')).map((p) => `.env.example: ${p}`));
  });
});

describe('README', () => {
  it('has the required sections and documents every variable', () => {
    assertNoProblems(checkReadme(read('README.md'), read('.env.example')).map((p) => `README.md: ${p}`));
  });
});

describe('art and audio assets', () => {
  it('the asset table matches the files in apps/web/src/assets', () => {
    const prefix = 'apps/web/src/assets/';
    const assets = files.filter((file) => file.startsWith(prefix)).map((file) => file.slice(prefix.length));
    assertNoProblems(
      checkAssetTable(read('docs/specs/art-and-audio-assets.md'), assets).map(
        (p) => `docs/specs/art-and-audio-assets.md: ${p}`,
      ),
    );
  });
});

describe('formatting', () => {
  const TEXT = /\.(md|mjs|js|ts|tsx|json|yml|yaml|sh|cs|csproj|slnx|props|css|html|svg|txt)$|(^|\/)\.[a-z.]+$|(^|\/)(LICENSE|Dockerfile)$/;

  it('text files use LF, have no trailing spaces, and end with one newline', () => {
    assertNoProblems(
      files
        .filter((file) => TEXT.test(file))
        .flatMap((file) => checkTextFormat(read(file)).map((p) => `${file}: ${p}`)),
    );
  });
});

describe('guidelines', () => {
  it('each state a rule, a method, and where it is enforced', () => {
    assertNoProblems(checkGuidelines(read('docs/guidelines.md')).map((p) => `docs/guidelines.md: ${p}`));
  });
});

describe('docs folder', () => {
  it('holds exactly the allowed files and folders', () => {
    assertNoProblems(checkEntries(entries('docs'), DOCS_ENTRIES, [], 'docs'));
  });

  it('has no ticket files, because work items are GitHub Issues', () => {
    const tickets = files.filter((file) => /^docs\/(tickets|work-items|issues)\//.test(file));
    assertNoProblems(tickets.map((file) => `${file}: track work items in GitHub Issues`));
  });

  it('has a status document with the required sections', () => {
    assertNoProblems(checkStatus(read('docs/status.md')).map((p) => `docs/status.md: ${p}`));
  });
});

describe('ADRs', () => {
  const names = documentsIn('docs/adr');

  it('folder has no subfolders', () => {
    assertNoProblems(foldersIn('docs/adr').map((name) => `docs/adr/${name}/ isn't allowed`));
  });

  it('are numbered in order with no gaps', () => {
    assertNoProblems(checkAdrNumbering(names));
  });

  it('each follow the ADR format', () => {
    assertNoProblems(
      names.flatMap((name) =>
        checkAdr(name, read(`docs/adr/${name}`), names).map((p) => `docs/adr/${name}: ${p}`),
      ),
    );
  });

  it('are all listed in the index with their current status', () => {
    const index = read('docs/adr/README.md');
    const problems = checkIndex(index, names).map((p) => `docs/adr/README.md: ${p}`);
    for (const name of names) {
      const row = index.split('\n').find((line) => line.includes(`(${name})`));
      const status = adrStatus(read(`docs/adr/${name}`));
      if (row && !row.includes(`| ${status} |`)) {
        problems.push(`docs/adr/README.md: the row for ${name} must show the status "${status}"`);
      }
    }
    assertNoProblems(problems);
  });
});

describe('specs', () => {
  const names = documentsIn('docs/specs');

  it('folder has no subfolders', () => {
    assertNoProblems(foldersIn('docs/specs').map((name) => `docs/specs/${name}/ isn't allowed`));
  });

  it('each follow the spec format and link to a tracking issue', () => {
    assertNoProblems(
      names.flatMap((name) =>
        checkSpec(name, read(`docs/specs/${name}`)).map((p) => `docs/specs/${name}: ${p}`),
      ),
    );
  });

  it('are all listed in the index', () => {
    assertNoProblems(
      checkIndex(read('docs/specs/README.md'), names).map((p) => `docs/specs/README.md: ${p}`),
    );
  });
});

describe('knowledge', () => {
  const names = documentsIn('docs/knowledge');
  const images = filesIn('docs/knowledge/images');

  it('folder holds only documents and an images folder', () => {
    assertNoProblems(
      foldersIn('docs/knowledge')
        .filter((name) => name !== 'images')
        .map((name) => `docs/knowledge/${name}/ isn't allowed`)
        .concat(foldersIn('docs/knowledge/images').map((name) => `docs/knowledge/images/${name}/ isn't allowed`)),
    );
  });

  it('documents and images follow the naming rules', () => {
    assertNoProblems([
      ...names.flatMap((name) => checkKnowledgeName(name).map((p) => `docs/knowledge/${name}: ${p}`)),
      ...images.flatMap((name) => checkImageName(name).map((p) => `docs/knowledge/images/${name}: ${p}`)),
    ]);
  });

  it('documents are all listed in the index', () => {
    assertNoProblems(
      checkIndex(read('docs/knowledge/README.md'), names).map((p) => `docs/knowledge/README.md: ${p}`),
    );
  });

  it('every image is used by a knowledge document', () => {
    const used = new Set(
      filesIn('docs/knowledge').flatMap((name) => linkTargets(read(`docs/knowledge/${name}`))),
    );
    assertNoProblems(
      images
        .filter((name) => !used.has(`images/${name}`))
        .map((name) => `docs/knowledge/images/${name}: no knowledge document uses this image`),
    );
  });
});

describe('links', () => {
  it('every relative link in a Markdown file points to a file that exists', () => {
    const problems = [];
    const folders = new Set(files.flatMap((file) => {
      const parts = file.split('/');
      return parts.slice(0, -1).map((_, i) => parts.slice(0, i + 1).join('/'));
    }));
    for (const file of files.filter((name) => name.endsWith('.md'))) {
      for (const target of linkTargets(read(file)).filter(isRelativeLink)) {
        const clean = decodeURIComponent(target.split('#')[0].split('?')[0]);
        if (clean === '') continue;
        const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(file), clean)).replace(/\/$/, '');
        if (!exists(resolved) && !folders.has(resolved)) {
          problems.push(`${file}: link to "${target}" doesn't point to a file`);
        }
      }
    }
    assertNoProblems(problems);
  });
});

describe('work item templates', () => {
  it('are exactly the three expected templates', () => {
    assertNoProblems(
      checkEntries(filesIn('.github/ISSUE_TEMPLATE'), Object.keys(ISSUE_TEMPLATES), ['config.yml'], '.github/ISSUE_TEMPLATE'),
    );
  });

  it('each have the required front matter and sections', () => {
    assertNoProblems(
      Object.keys(ISSUE_TEMPLATES)
        .filter((name) => exists(`.github/ISSUE_TEMPLATE/${name}`))
        .flatMap((name) =>
          checkIssueTemplate(name, read(`.github/ISSUE_TEMPLATE/${name}`)).map(
            (p) => `.github/ISSUE_TEMPLATE/${name}: ${p}`,
          ),
        ),
    );
  });
});

describe('instructions', () => {
  for (const file of ['CLAUDE.md', '.github/copilot-instructions.md']) {
    it(`${file} names the home of each kind of content`, () => {
      assert.ok(exists(file), `${file} is missing. ${FIX}`);
      assertNoProblems(checkMentions(read(file), INSTRUCTION_MENTIONS).map((p) => `${file}: ${p}`));
    });
  }

  it('the check script runs the tests, and CI runs the check script', () => {
    assertNoProblems(
      checkCheckScript(read('scripts/check.sh'), {
        hasServer: entries('apps').includes('server'),
        hasWeb: entries('apps').includes('web'),
      }).map((p) => `scripts/check.sh: ${p}`),
    );
    assert.match(read('.github/workflows/ci.yml'), /scripts\/check\.sh/, 'CI must run scripts/check.sh');
    assert.match(read('package.json'), /"test":\s*"node --test/, 'package.json needs a test script');
  });

  it('organization tests live in tests/organization', () => {
    assertNoProblems(
      files
        .filter((file) => file.startsWith('tests/') && !file.startsWith('tests/organization/'))
        .filter((file) => /organi[sz]ation|structure|layout/i.test(file))
        .map((file) => `${file}: organization tests belong in tests/organization/`),
    );
  });
});
