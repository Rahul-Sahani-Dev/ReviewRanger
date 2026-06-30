import { content } from '../content.js';
import process from 'process';

let hasErrors = false;

function error(msg) {
  console.error(`❌ ${msg}`);
  hasErrors = true;
}

const seenIds = new Set();
let puzzleCount = 0;
let findingCount = 0;

for (const theme of content.themes) {
  for (const puzzle of theme.puzzles) {
    puzzleCount++;
    
    // Check ID
    if (!puzzle.id) {
      error(`Puzzle missing ID in theme ${theme.id}`);
    } else {
      if (seenIds.has(puzzle.id)) {
        error(`Duplicate puzzle ID: ${puzzle.id}`);
      }
      seenIds.add(puzzle.id);
    }

    // Required fields
    if (!puzzle.promise) error(`Puzzle ${puzzle.id} missing promise`);
    if (!puzzle.snippet || !Array.isArray(puzzle.snippet)) error(`Puzzle ${puzzle.id} missing snippet array`);
    if (!puzzle.findings || !Array.isArray(puzzle.findings)) {
      error(`Puzzle ${puzzle.id} missing findings array`);
    } else {
      // Check finding line references
      const maxLine = puzzle.snippet.length;
      for (let i = 0; i < puzzle.findings.length; i++) {
        findingCount++;
        const finding = puzzle.findings[i];
        
        // Finding required fields
        if (!finding.lines || !Array.isArray(finding.lines)) error(`Puzzle ${puzzle.id} finding ${i} missing lines array`);
        if (!finding.summary) error(`Puzzle ${puzzle.id} finding ${i} missing summary`);
        if (!finding.why) error(`Puzzle ${puzzle.id} finding ${i} missing why`);
        if (!finding.rule) error(`Puzzle ${puzzle.id} finding ${i} missing rule`);
        if (!finding.fix) error(`Puzzle ${puzzle.id} finding ${i} missing fix`);
        
        // Lines validity
        if (finding.lines) {
          for (const line of finding.lines) {
            if (line < 1 || line > maxLine) {
              error(`Puzzle ${puzzle.id} has invalid line reference ${line}. Snippet has ${maxLine} lines.`);
            }
          }
        }
      }
    }
  }
}

console.log(`Validated ${content.themes.length} themes, ${puzzleCount} puzzles, ${findingCount} findings.`);
if (hasErrors) {
  console.error("Validation failed.");
  process.exit(1);
} else {
  console.log("✅ All checks passed.");
}
