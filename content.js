(() => {
  function extractProgramData() {
    const title = document.querySelector('h1.program-title')?.textContent?.trim() || '';
    const url = window.location.href;

    // Program description (the markdown-rendered HTML block)
    const descriptionEl = document.querySelector('#program-rules-paragraph.markdown-html');
    const descriptionHtml = descriptionEl?.innerHTML?.trim() || '';
    const descriptionText = descriptionEl?.innerText?.trim() || '';

    // Reward grid
    const rewards = {};
    const rewardGrid = document.querySelector('ywh-reward-grid section.reward-grid');
    if (rewardGrid) {
      const values = rewardGrid.querySelectorAll('.reward-grid-value .tag-content');
      const titles = rewardGrid.querySelectorAll('.reward-grid-title');
      titles.forEach((titleEl, i) => {
        const label = titleEl.textContent.trim();
        const value = values[i]?.textContent?.trim() || '';
        if (label) rewards[label] = value;
      });
    }

    // Scopes
    const scopes = [];
    document.querySelectorAll('#program-scopes-table tbody tr:not(.rewards-row)').forEach(row => {
      const scopeEl = row.querySelector('span.scope');
      const typeEl = row.querySelector('.cdk-column-type');
      const reportsEl = row.querySelector('.cdk-column-reports .tag-content');
      const assetValueEl = row.querySelector('.cdk-column-assetValue .tag-content');
      if (scopeEl) {
        scopes.push({
          scope: scopeEl.textContent.trim(),
          type: typeEl?.textContent?.trim() || '',
          reports: reportsEl?.textContent?.trim() || '0',
          assetValue: assetValueEl?.textContent?.trim() || ''
        });
      }
    });

    // Qualifying vulnerabilities
    const qualifying = [];
    const qualSection = descriptionEl?.querySelector('h3:not(.mt-4)')
      ? null
      : document.querySelector('#program-vulneraibility-types');
    if (qualSection) {
      const qualDiv = qualSection.querySelector('div:first-of-type');
      qualDiv?.querySelectorAll('li').forEach(li => {
        qualifying.push(li.textContent.trim());
      });
    }

    // Non-qualifying vulnerabilities
    const nonQualifying = [];
    const nonQualDiv = qualSection?.querySelectorAll('div')?.[1];
    nonQualDiv?.querySelectorAll('li').forEach(li => {
      nonQualifying.push(li.textContent.trim());
    });

    // Out of scopes
    const outOfScopes = [];
    const outOfScopeSection = document.querySelectorAll('#program-scopes ~ div li, h3.mb-2 ~ span li');
    document.querySelectorAll('h3').forEach(h3 => {
      if (h3.textContent.trim() === 'Out of scopes') {
        const container = h3.nextElementSibling;
        container?.querySelectorAll('li').forEach(li => {
          outOfScopes.push(li.textContent.trim());
        });
      }
    });

    // Program info
    const programType = document.querySelector('#program-card-information-section .tag-content')?.textContent?.trim() || '';
    const visibility = document.querySelectorAll('#program-card-information-section .tag-content')?.[1]?.textContent?.trim() || '';
    const lastUpdate = '';
    document.querySelectorAll('#program-card-information-section span').forEach(span => {
      if (span.textContent.includes('Last update on')) {
        const match = span.textContent.match(/Last update on (\S+)/);
        if (match) rewards.lastUpdate = match[1];
      }
    });

    // User agent requirement
    let userAgent = '';
    document.querySelectorAll('#hunting-requirements strong').forEach(el => {
      const text = el.textContent.trim();
      if (text && !text.includes('collaboration')) {
        userAgent = text;
      }
    });

    return {
      title,
      url,
      programType,
      visibility,
      descriptionText,
      descriptionHtml,
      rewards,
      scopes,
      outOfScopes,
      qualifyingVulnerabilities: qualifying,
      nonQualifyingVulnerabilities: nonQualifying,
      userAgent,
      extractedAt: new Date().toISOString()
    };
  }

  // Convert data to markdown
  function toMarkdown(data) {
    let md = `# ${data.title}\n\n`;
    md += `**URL:** ${data.url}\n`;
    md += `**Type:** ${data.programType}\n`;
    md += `**Visibility:** ${data.visibility}\n`;
    if (data.userAgent) md += `**User-Agent:** \`${data.userAgent}\`\n`;
    md += `**Extracted:** ${data.extractedAt}\n\n`;

    md += `## Rewards\n\n`;
    md += `| Severity | Amount |\n|----------|--------|\n`;
    for (const [key, val] of Object.entries(data.rewards)) {
      if (key === 'lastUpdate') continue;
      md += `| ${key} | ${val} |\n`;
    }
    md += '\n';

    md += `## Program Description\n\n${data.descriptionText}\n\n`;

    md += `## Scopes (${data.scopes.length})\n\n`;
    md += `| Scope | Type | Reports | Asset Value |\n|-------|------|---------|-------------|\n`;
    data.scopes.forEach(s => {
      md += `| ${s.scope} | ${s.type} | ${s.reports} | ${s.assetValue} |\n`;
    });
    md += '\n';

    if (data.outOfScopes.length) {
      md += `## Out of Scopes\n\n`;
      data.outOfScopes.forEach(s => { md += `- ${s}\n`; });
      md += '\n';
    }

    if (data.qualifyingVulnerabilities.length) {
      md += `## Qualifying Vulnerabilities\n\n`;
      data.qualifyingVulnerabilities.forEach(v => { md += `- ${v}\n`; });
      md += '\n';
    }

    if (data.nonQualifyingVulnerabilities.length) {
      md += `## Non-Qualifying Vulnerabilities\n\n`;
      data.nonQualifyingVulnerabilities.forEach(v => { md += `- ${v}\n`; });
      md += '\n';
    }

    return md;
  }

  // Convert data to plain text
  function toText(data) {
    let txt = `${data.title}\n${'='.repeat(data.title.length)}\n\n`;
    txt += `URL: ${data.url}\n`;
    txt += `Type: ${data.programType}\n`;
    txt += `Visibility: ${data.visibility}\n`;
    if (data.userAgent) txt += `User-Agent: ${data.userAgent}\n`;
    txt += `Extracted: ${data.extractedAt}\n\n`;

    txt += `REWARDS\n${'-'.repeat(7)}\n`;
    for (const [key, val] of Object.entries(data.rewards)) {
      if (key === 'lastUpdate') continue;
      txt += `  ${key}: ${val}\n`;
    }
    txt += '\n';

    txt += `PROGRAM DESCRIPTION\n${'-'.repeat(19)}\n${data.descriptionText}\n\n`;

    txt += `SCOPES (${data.scopes.length})\n${'-'.repeat(10)}\n`;
    data.scopes.forEach(s => {
      txt += `  ${s.scope} [${s.type}] - Reports: ${s.reports} - Asset: ${s.assetValue}\n`;
    });
    txt += '\n';

    if (data.outOfScopes.length) {
      txt += `OUT OF SCOPES\n${'-'.repeat(13)}\n`;
      data.outOfScopes.forEach(s => { txt += `  - ${s}\n`; });
      txt += '\n';
    }

    if (data.qualifyingVulnerabilities.length) {
      txt += `QUALIFYING VULNERABILITIES\n${'-'.repeat(25)}\n`;
      data.qualifyingVulnerabilities.forEach(v => { txt += `  - ${v}\n`; });
      txt += '\n';
    }

    if (data.nonQualifyingVulnerabilities.length) {
      txt += `NON-QUALIFYING VULNERABILITIES\n${'-'.repeat(29)}\n`;
      data.nonQualifyingVulnerabilities.forEach(v => { txt += `  - ${v}\n`; });
      txt += '\n';
    }

    return txt;
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extract') {
      const data = extractProgramData();
      sendResponse(data);
    } else if (request.action === 'exportJSON') {
      const data = extractProgramData();
      sendResponse({ content: JSON.stringify(data, null, 2), filename: `${sanitize(data.title)}.json` });
    } else if (request.action === 'exportTXT') {
      const data = extractProgramData();
      sendResponse({ content: toText(data), filename: `${sanitize(data.title)}.txt` });
    } else if (request.action === 'exportMD') {
      const data = extractProgramData();
      sendResponse({ content: toMarkdown(data), filename: `${sanitize(data.title)}.md` });
    }
    return true;
  });

  function sanitize(name) {
    return name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 80) || 'ywh_program';
  }
})();
