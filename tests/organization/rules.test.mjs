// Unit tests for the rules themselves, against good and bad examples.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ADR_SECTIONS,
  SPEC_SECTIONS,
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
  headings,
  isRelativeLink,
  linkTargets,
  stripCodeBlocks,
} from './rules.mjs';

const adr = ({ number = '001', status = 'Accepted', sections = ADR_SECTIONS } = {}) =>
  [`# ADR-${number}: A decision`, '']
    .concat(sections.flatMap((s) => [`## ${s}`, '', s === 'Status' ? status : 'Text.', '']))
    .join('\n');

const spec = ({ tracking = 'Tracking issue: [#7](https://github.com/bradreimer/floppy-schnauzer/issues/7).', sections = SPEC_SECTIONS } = {}) =>
  ['# A capability', '', tracking, '']
    .concat(sections.flatMap((s) => [`## ${s}`, '', 'Text.', '']))
    .join('\n');

describe('Markdown helpers', () => {
  it('ignores headings and links inside code blocks', () => {
    const markdown = '## Real\n\n```markdown\n## Example\n[x](missing.md)\n```\n\n[y](real.md)\n';
    assert.deepEqual(headings(markdown, 2), ['Real']);
    assert.deepEqual(linkTargets(markdown), ['real.md']);
    assert.ok(!stripCodeBlocks(markdown).includes('Example'));
  });

  it('finds links and images, and ignores code spans', () => {
    const markdown = 'See [a](a.md#part), ![b](images/b.svg), and `[c](c.md)`.';
    assert.deepEqual(linkTargets(markdown), ['a.md#part', 'images/b.svg']);
  });

  it('tells relative links from web links and anchors', () => {
    assert.ok(isRelativeLink('../adr/README.md'));
    assert.ok(!isRelativeLink('https://example.com'));
    assert.ok(!isRelativeLink('mailto:someone@example.com'));
    assert.ok(!isRelativeLink('#section'));
  });
});

describe('checkEntries', () => {
  it('passes when every entry is required or optional', () => {
    assert.deepEqual(checkEntries(['a', 'b'], ['a'], ['b'], 'root'), []);
  });

  it('reports a missing required entry and a stray entry', () => {
    const problems = checkEntries(['stray.txt'], ['a'], [], 'root');
    assert.equal(problems.length, 2);
    assert.match(problems[0], /"a" is missing/);
    assert.match(problems[1], /"stray.txt" isn't allowed/);
  });
});

describe('checkAdr', () => {
  it('passes a well-formed ADR', () => {
    assert.deepEqual(checkAdr('ADR-001-a-decision.md', adr()), []);
  });

  it('rejects a bad file name', () => {
    assert.equal(checkAdr('adr-1-Decision.md', adr()).length, 1);
    assert.equal(checkAdr('ADR-01-decision.md', adr()).length, 1);
  });

  it('rejects a title number that differs from the file number', () => {
    assert.match(checkAdr('ADR-002-a-decision.md', adr()).join(), /doesn't match/);
  });

  it('rejects missing, extra, or reordered sections', () => {
    const missing = adr({ sections: ADR_SECTIONS.filter((s) => s !== 'Consequences') });
    const extra = adr({ sections: [...ADR_SECTIONS, 'Notes'] });
    const reordered = adr({ sections: [...ADR_SECTIONS].reverse() });
    for (const markdown of [missing, extra, reordered]) {
      assert.match(checkAdr('ADR-001-a-decision.md', markdown).join(), /sections must be exactly/);
    }
  });

  it('rejects an unknown status', () => {
    assert.match(checkAdr('ADR-001-a-decision.md', adr({ status: 'Done' })).join(), /Status must be/);
  });

  it('accepts a superseded status only when the other ADR exists', () => {
    const markdown = adr({ status: 'Superseded by ADR-002' });
    const names = ['ADR-001-a-decision.md', 'ADR-002-a-better-decision.md'];
    assert.deepEqual(checkAdr(names[0], markdown, names), []);
    assert.match(checkAdr(names[0], markdown, [names[0]]).join(), /doesn't exist/);
  });
});

describe('checkAdrNumbering', () => {
  it('passes numbers that run in order', () => {
    assert.deepEqual(checkAdrNumbering(['ADR-001-a.md', 'ADR-002-b.md', 'README.md']), []);
  });

  it('rejects a gap, a duplicate, and a start above 001', () => {
    assert.equal(checkAdrNumbering(['ADR-001-a.md', 'ADR-003-c.md']).length, 1);
    assert.equal(checkAdrNumbering(['ADR-001-a.md', 'ADR-001-b.md']).length, 1);
    assert.equal(checkAdrNumbering(['ADR-002-b.md']).length, 1);
  });
});

describe('checkSpec', () => {
  it('passes a well-formed spec', () => {
    assert.deepEqual(checkSpec('gameplay.md', spec()), []);
  });

  it('rejects a bad file name', () => {
    assert.equal(checkSpec('Game_Play.md', spec()).length, 1);
  });

  it('rejects a spec with no tracking issue', () => {
    assert.match(checkSpec('gameplay.md', spec({ tracking: '' })).join(), /Tracking issue/);
  });

  it('rejects a tracking issue in another repository', () => {
    const tracking = 'Tracking issue: [#7](https://github.com/someone/else/issues/7).';
    assert.match(checkSpec('gameplay.md', spec({ tracking })).join(), /must link to/);
  });

  it('rejects missing sections', () => {
    const markdown = spec({ sections: SPEC_SECTIONS.filter((s) => s !== 'Non-goals') });
    assert.match(checkSpec('gameplay.md', markdown).join(), /sections must be exactly/);
  });
});

describe('knowledge rules', () => {
  it('checks document and image names', () => {
    assert.deepEqual(checkKnowledgeName('webgpu-notes.md'), []);
    assert.equal(checkKnowledgeName('WebGPU Notes.md').length, 1);
    assert.deepEqual(checkImageName('logo-concept.svg'), []);
    assert.equal(checkImageName('Logo.SVG').length, 1);
    assert.equal(checkImageName('diagram.pdf').length, 1);
  });
});

describe('checkIndex', () => {
  it('reports each document the index does not link to', () => {
    const index = '| [one](one.md) | [two](./two.md) |\n\n```markdown\n[three](three.md)\n```\n';
    assert.deepEqual(checkIndex(index, ['one.md', 'two.md']), []);
    assert.deepEqual(checkIndex(index, ['one.md', 'three.md']), ["the index doesn't link to three.md"]);
  });
});

describe('checkIssueTemplate', () => {
  const template = (label, sections) =>
    `---\nname: A\nabout: B\ntitle: "[C]: "\nlabels: ["${label}"]\n---\n\n` +
    sections.map((s) => `## ${s}\n`).join('\n');

  it('passes a complete template', () => {
    const sections = ['Problem', 'Proposed solution', 'Related spec'];
    assert.deepEqual(checkIssueTemplate('feature_request.md', template('enhancement', sections)), []);
  });

  it('accepts labels as written by the GitHub template editor', () => {
    const sections = ['Problem', 'Proposed solution', 'Related spec'];
    const edited = template('enhancement', sections).replace('["enhancement"]', 'enhancement');
    assert.deepEqual(checkIssueTemplate('feature_request.md', edited), []);
    const partial = edited.replace('labels: enhancement', 'labels: enhancement-later');
    assert.match(checkIssueTemplate('feature_request.md', partial).join(), /labels must include/);
  });

  it('rejects a wrong label, a missing section, and an unknown template', () => {
    assert.match(
      checkIssueTemplate('feature_request.md', template('bug', ['Problem'])).join(),
      /labels must include "enhancement".*"Proposed solution" is missing/,
    );
    assert.equal(checkIssueTemplate('task.md', template('task', [])).length, 1);
  });
});

describe('checkMentions and checkStatus', () => {
  it('reports each missing phrase', () => {
    assert.deepEqual(checkMentions('See docs/adr/.', ['docs/adr/', 'docs/specs/']), [
      'must mention "docs/specs/"',
    ]);
  });

  it('reports each missing status section', () => {
    const markdown = '# Status\n\n## Current milestone\n\n## Completed\n\n## Next\n';
    assert.deepEqual(checkStatus(markdown), ['section "In progress" is missing']);
  });
});

describe('checkGuidelines', () => {
  const guideline = (number, parts = ['**Rule.**', '**Method.**', '**Enforced by.**']) =>
    `## ${number}. A guideline\n\n${parts.map((part) => `${part} Text.`).join('\n\n')}\n`;
  const all = (count) => '# Guidelines\n\n' + Array.from({ length: count }, (_, i) => guideline(i + 1)).join('\n');

  it('passes seven numbered guidelines that each state rule, method, and enforcement', () => {
    assert.deepEqual(checkGuidelines(all(7)), []);
  });

  it('rejects a wrong count, a wrong number, and a missing part', () => {
    assert.match(checkGuidelines(all(6)).join(), /expected 7 guidelines, found 6/);
    assert.match(checkGuidelines(all(6) + '\n' + guideline(9)).join(), /must be numbered 7/);
    assert.match(
      checkGuidelines(all(6) + '\n' + guideline(7, ['**Rule.**'])).join(),
      /must state \*\*Method\.\*\*/,
    );
  });
});

describe('checkEnvExample', () => {
  it('passes plain settings and empty secrets', () => {
    assert.deepEqual(checkEnvExample('# Note\nPORT_API=8080\n\nSCORE_API_KEY=\n'), []);
  });

  it('rejects a secret with a value and a malformed line', () => {
    assert.match(checkEnvExample('SCORE_API_KEY=abc123\n').join(), /must be empty/);
    assert.match(checkEnvExample('SESSION_SECRET=x\n').join(), /must be empty/);
    assert.match(checkEnvExample('export FOO=bar\n').join(), /NAME=value/);
  });
});

describe('checkTextFormat', () => {
  it('passes clean text', () => {
    assert.deepEqual(checkTextFormat('one\ntwo\n'), []);
    assert.deepEqual(checkTextFormat(''), []);
  });

  it('rejects CRLF, trailing spaces, and a missing or doubled final newline', () => {
    assert.match(checkTextFormat('one\r\ntwo\r\n').join(), /CRLF/);
    assert.match(checkTextFormat('one\ntwo  \n').join(), /line 2 has trailing spaces/);
    assert.match(checkTextFormat('one').join(), /must end with a newline/);
    assert.match(checkTextFormat('one\n\n').join(), /exactly one newline/);
  });
});

describe('checkCheckScript', () => {
  const base = '#!/usr/bin/env bash\nset -euo pipefail\nnpm test\n';
  const server = 'dotnet format --verify-no-changes\ndotnet build -warnaserror\ndotnet test\n';
  const web = '(cd apps/web && npm run format:check && npm run lint && npm run typecheck && npm test)\n';

  it('needs only the organization tests when no app exists', () => {
    assert.deepEqual(checkCheckScript(base, { hasServer: false, hasWeb: false }), []);
    assert.match(checkCheckScript('echo ok\n', { hasServer: false, hasWeb: false }).join(), /npm test/);
  });

  it('needs the .NET steps once apps/server exists', () => {
    assert.equal(checkCheckScript(base, { hasServer: true, hasWeb: false }).length, 3);
    assert.deepEqual(checkCheckScript(base + server, { hasServer: true, hasWeb: false }), []);
  });

  it('needs the UI steps once apps/web exists', () => {
    assert.equal(checkCheckScript(base, { hasServer: false, hasWeb: true }).length, 4);
    assert.deepEqual(checkCheckScript(base + web, { hasServer: false, hasWeb: true }), []);
  });

  it('ignores a step that is only mentioned in a comment', () => {
    const commented = base + '# dotnet format --verify-no-changes\n# dotnet build\n# dotnet test\n';
    assert.equal(checkCheckScript(commented, { hasServer: true, hasWeb: false }).length, 3);
  });
});

describe('checkTestProjects', () => {
  it('requires a .Tests project for each source project', () => {
    assert.deepEqual(checkTestProjects(['Game.Core'], ['Game.Core.Tests']), []);
    assert.equal(checkTestProjects(['Game.Core', 'Game.Api'], ['Game.Core.Tests']).length, 1);
  });
});

describe('checkReadme', () => {
  const env = '# The port\nPORT_API=8080\n# ASPNETCORE_URLS=x\n';
  const readme = (titles, extra = '') => titles.map((title) => `## ${title}\n`).join('\n') + extra;
  const all = ['Play', 'Develop', 'Run in Docker', 'Configuration'];

  it('passes a README with every section and variable', () => {
    assert.deepEqual(checkReadme(readme(all, '`PORT_API` `ASPNETCORE_URLS`'), env), []);
  });

  it('rejects a missing or misordered section', () => {
    const vars = '`PORT_API` `ASPNETCORE_URLS`';
    assert.match(checkReadme(readme(all.slice(1), vars), env).join(), /sections must include/);
    assert.match(checkReadme(readme([...all].reverse(), vars), env).join(), /sections must include/);
  });

  it('rejects an undocumented variable, including a commented one', () => {
    const problems = checkReadme(readme(all), env).join();
    assert.match(problems, /variable PORT_API/);
    assert.match(problems, /variable ASPNETCORE_URLS/);
  });
});

describe('checkAssetTable', () => {
  const spec = '| File | Size |\n| --- | --- |\n| `sky.png` | 400 × 700 |\n| `audio/jump.wav` | 0.1 s |\n';

  it('passes when the table and the folder match', () => {
    assert.deepEqual(checkAssetTable(spec, ['audio/jump.wav', 'sky.png']), []);
  });

  it('reports a file missing from the table and a listed file that does not exist', () => {
    assert.deepEqual(checkAssetTable(spec, ['sky.png', 'logo.png']), [
      'logo.png is in the assets folder but not in the table',
      'audio/jump.wav is in the table but not in the assets folder',
    ]);
  });
});
