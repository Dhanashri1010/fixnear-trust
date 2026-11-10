// ===================================================================
// FixNear Trust - Automated JSX & Alert/Toast Translation Scanner
// Scans all .jsx files in src/ for untranslated text & call arguments
// ===================================================================

import fs from 'fs';
import path from 'path';
import parser from '@babel/parser';
import _traverse from '@babel/traverse';

const traverse = _traverse.default?.default || _traverse.default || _traverse;

const ALLOWLIST = new Set([
  'FixNear',
  'Trust',
  'FixNear Trust',
  '₹',
  '%',
  '#',
  '/',
  '+',
  '-',
  '*',
  '|',
  '•',
  '·',
  '●',
  '⚡',
  '🛡️',
  'ℹ️',
  '—',
  '–',
  ':',
  '...',
  '..',
  '.',
  ',',
  '★',
  '☆',
  '→',
  '←',
  '↑',
  '↓',
  '✓',
  '✕',
  '--',
  '---',
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '100',
  'INR',
  'EN',
  'HI',
  'MR',
  'HI (हिंदी)',
  'MR (मराठी)',
  'EN (English)',
  'हिंदी',
  'मराठी',
  'English',
  'PDF',
  'JSON',
  'CSV',
]);

export function isSymbolOrNumber(str) {
  // Check if string contains only digits, whitespace, symbols and punctuation, plus AM/PM
  const clean = str.replace(/[\s\d₹%#\/+\-*|•:\.,\(\)\{\}\[\]\$\\\/\'\’"`★☆→←↑↓✓✕=><_@&;!?\-~]|AM|PM/gi, '');
  return clean.length === 0;
}

export function scanFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');
  let ast;
  try {
    ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx']
    });
  } catch (err) {
    return [{ file: filePath, line: 1, type: 'ParseError', text: err.message }];
  }

  const issues = [];
  traverse(ast, {
    JSXText(pathNode) {
      const val = pathNode.node.value.trim();
      if (!val) return;
      if (ALLOWLIST.has(val)) return;
      if (isSymbolOrNumber(val)) return;
      issues.push({
        file: filePath,
        line: pathNode.node.loc.start.line,
        type: 'JSXText',
        text: val
      });
    },
    CallExpression(pathNode) {
      const callee = pathNode.node.callee;
      let isTarget = false;
      if (callee.type === 'Identifier' && (callee.name === 'alert' || callee.name === 'confirm')) {
        isTarget = true;
      } else if (callee.type === 'MemberExpression' && callee.object?.name === 'toast') {
        isTarget = true;
      } else if (callee.type === 'Identifier' && callee.name === 'toast') {
        isTarget = true;
      }
      if (isTarget && pathNode.node.arguments.length > 0) {
        const arg0 = pathNode.node.arguments[0];
        if (arg0.type === 'StringLiteral') {
          const val = arg0.value.trim();
          if (val && !ALLOWLIST.has(val) && !isSymbolOrNumber(val)) {
            issues.push({
              file: filePath,
              line: arg0.loc.start.line,
              type: 'CallArg',
              text: val
            });
          }
        }
      }
    }
  });
  return issues;
}

export function walkDirectory(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walkDirectory(fullPath));
    } else if (fullPath.endsWith('.jsx')) {
      results.push(fullPath);
    }
  }
  return results;
}

export function scanAll(rootDir = 'src') {
  const files = walkDirectory(rootDir);
  const allIssues = [];
  for (const file of files) {
    const issues = scanFile(file);
    if (issues.length > 0) {
      allIssues.push(...issues);
    }
  }
  return allIssues;
}

if (process.argv[1] && process.argv[1].endsWith('scan-jsx-translations.js')) {
  const issues = scanAll('src');
  if (issues.length === 0) {
    console.log('✅ All JSX text and alert/toast/confirm strings in src/ are translated!');
    process.exit(0);
  } else {
    console.log(`❌ Found ${issues.length} untranslated strings across JSX files:`);
    const byFile = {};
    for (const issue of issues) {
      const rel = path.relative(process.cwd(), issue.file).replace(/\\/g, '/');
      if (!byFile[rel]) byFile[rel] = [];
      byFile[rel].push(issue);
    }
    for (const [file, fileIssues] of Object.entries(byFile)) {
      console.log(`\n📁 ${file} (${fileIssues.length} issues):`);
      for (const issue of fileIssues.slice(0, 5)) {
        console.log(`   L${issue.line} [${issue.type}]: "${issue.text}"`);
      }
      if (fileIssues.length > 5) {
        console.log(`   ... and ${fileIssues.length - 5} more`);
      }
    }
    process.exit(1);
  }
}
