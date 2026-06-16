/**
 * Parses and transpiles a simple Python-like script into JavaScript.
 */
export function transpilePythonToJS(pythonCode: string): { jsCode: string; error: string | null } {
  try {
    const lines = pythonCode.split(/\r?\n/);
    const outputLines: string[] = [];
    const indentStack: number[] = [];
    let loopCounter = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Skip empty lines, keep comments
      if (trimmed === '' || trimmed.startsWith('#')) {
        outputLines.push(line.replace(/#/g, '//'));
        continue;
      }

      // Measure indentation
      const leadingSpaces = line.search(/\S/);
      
      // Manage indentation closures
      while (indentStack.length > 0 && leadingSpaces < indentStack[indentStack.length - 1]) {
        const indent = indentStack.pop();
        const indentStr = ' '.repeat(indent || 0);
        outputLines.push(`${indentStr}}`);
      }

      if (indentStack.length === 0 || leadingSpaces > indentStack[indentStack.length - 1]) {
        if (leadingSpaces > 0 && (indentStack.length === 0 || leadingSpaces > indentStack[indentStack.length - 1])) {
          indentStack.push(leadingSpaces);
        }
      }

      let parsedLine = trimmed;

      // Strip trailing comment from content
      let commentSuffix = '';
      const hashIndex = parsedLine.indexOf('#');
      if (hashIndex !== -1) {
        commentSuffix = ' ' + parsedLine.substring(hashIndex).replace(/#/g, '//');
        parsedLine = parsedLine.substring(0, hashIndex).trim();
      }

      // Translate structures
      if (parsedLine.startsWith('def ') && parsedLine.endsWith(':')) {
        const match = parsedLine.match(/def\s+(\w+)\s*\(([^)]*)\)\s*:/);
        if (match) {
          parsedLine = `function ${match[1]}(${match[2]}) {`;
        }
      } else if (parsedLine.startsWith('if ') && parsedLine.endsWith(':')) {
        const expr = parsedLine.substring(3, parsedLine.length - 1).trim();
        parsedLine = `if (${translateExpressions(expr)}) {`;
      } else if (parsedLine.startsWith('elif ') && parsedLine.endsWith(':')) {
        const expr = parsedLine.substring(5, parsedLine.length - 1).trim();
        parsedLine = `else if (${translateExpressions(expr)}) {`;
      } else if (parsedLine.startsWith('else:') || parsedLine === 'else :') {
        parsedLine = `else {`;
      } else if (parsedLine.startsWith('while ') && parsedLine.endsWith(':')) {
        const expr = parsedLine.substring(6, parsedLine.length - 1).trim();
        loopCounter++;
        parsedLine = `let _loop_guard_${loopCounter} = 0;\n${' '.repeat(leadingSpaces)}while (${translateExpressions(expr)}) {\n${' '.repeat(leadingSpaces + 2)}if (++_loop_guard_${loopCounter} > 200) throw new Error("Infinite loop safety guard triggered");`;
      } else {
        // Normal statement, replace pythonisms
        parsedLine = translateExpressions(parsedLine);
        // Ensure semicolons or endings are comfortable in JS
        if (!parsedLine.endsWith(';') && !parsedLine.endsWith('{') && !parsedLine.endsWith('}')) {
          parsedLine += ';';
        }
      }

      outputLines.push(' '.repeat(leadingSpaces) + parsedLine + commentSuffix);
    }

    // Close remaining indentation levels
    while (indentStack.length > 0) {
      const indent = indentStack.pop();
      const indentStr = ' '.repeat(indent || 0);
      outputLines.push(`${indentStr}}`);
    }

    const compiledStr = outputLines.join('\n');
    return { jsCode: compiledStr, error: null };
  } catch (error: any) {
    return { jsCode: '', error: error?.message || 'Syntax translation error' };
  }
}

/**
 * Translates small python expressions to JavaScript equivalent.
 */
function translateExpressions(expr: string): string {
  let js = expr;

  // Simple token replacements
  // Ensure we replace whole words for python operators
  js = js.replace(/\band\b/g, '&&');
  js = js.replace(/\bor\b/g, '||');
  js = js.replace(/\bnot\b/g, '!');
  js = js.replace(/\bNone\b/g, 'null');
  js = js.replace(/\bTrue\b/g, 'true');
  js = js.replace(/\bFalse\b/g, 'false');
  js = js.replace(/\bis\s+None\b/g, '=== null');
  js = js.replace(/\bis\s+not\s+None\b/g, '!== null');

  return js;
}

// Preset code templates
export const CODE_TEMPLATES = {
  PREDATOR: `# Hunter Predator
# nearby order: n, s, e, w, ne, nw, se, sw

def cell(health, nearby):
    if health <= 1:
        return "d"
    elif nearby[0] == "enemy":
        return "an"
    elif nearby[1] == "enemy":
        return "as"
    elif nearby[2] == "enemy":
        return "ae"
    elif nearby[3] == "enemy":
        return "aw"
    elif nearby[4] == "enemy":
        return "ane"
    elif nearby[5] == "enemy":
        return "anw"
    elif nearby[6] == "enemy":
        return "ase"
    elif nearby[7] == "enemy":
        return "asw"
    elif nearby[2] == "empty":
        return "me"
    elif nearby[0] == "empty":
        return "mn"
    else:
        return "d"`,

  EXPANDING_COLONY: `# Expanding Colony
# Reproduce into open space. Eat nearby opponents first.
# nearby order: n, s, e, w, ne, nw, se, sw

def cell(health, nearby):
    if health <= 1:
        return "d"
    elif nearby[0] == "enemy":
        return "an"
    elif nearby[1] == "enemy":
        return "as"
    elif nearby[2] == "enemy":
        return "ae"
    elif nearby[3] == "enemy":
        return "aw"
    elif nearby[4] == "enemy":
        return "ane"
    elif nearby[5] == "enemy":
        return "anw"
    elif nearby[6] == "enemy":
        return "ase"
    elif nearby[7] == "enemy":
        return "asw"
    elif nearby[4] == "empty":
        return "rne"
    elif nearby[6] == "empty":
        return "rse"
    elif nearby[5] == "empty":
        return "rnw"
    elif nearby[7] == "empty":
        return "rsw"
    elif nearby[0] == "empty":
        return "rn"
    elif nearby[1] == "empty":
        return "rs"
    elif nearby[2] == "empty":
        return "re"
    elif nearby[3] == "empty":
        return "rw"
    else:
        return "d"`,

  SENTINEL: `# Cautious Sentinel
# Hold position, eat immediate threats, reproduce when space is open.
# nearby order: n, s, e, w, ne, nw, se, sw

def cell(health, nearby):
    if health < 40:
        return "d"
    elif nearby[0] == "enemy":
        return "an"
    elif nearby[2] == "enemy":
        return "ae"
    elif nearby[3] == "enemy":
        return "aw"
    elif nearby[1] == "enemy":
        return "as"
    elif nearby[4] == "enemy":
        return "ane"
    elif nearby[5] == "enemy":
        return "anw"
    elif nearby[6] == "enemy":
        return "ase"
    elif nearby[7] == "enemy":
        return "asw"
    elif nearby[0] == "empty":
        return "rn"
    elif nearby[1] == "empty":
        return "rs"
    else:
        return "d"`,

  RANDOM_EXPLORER: `# Open-Space Explorer
# No random calls: literal choices only, safe for validation.
# nearby order: n, s, e, w, ne, nw, se, sw

def cell(health, nearby):
    if health <= 1:
        return "d"
    elif nearby[4] == "enemy":
        return "ane"
    elif nearby[6] == "enemy":
        return "ase"
    elif nearby[5] == "enemy":
        return "anw"
    elif nearby[7] == "enemy":
        return "asw"
    elif nearby[0] == "enemy":
        return "an"
    elif nearby[1] == "enemy":
        return "as"
    elif nearby[2] == "enemy":
        return "ae"
    elif nearby[3] == "enemy":
        return "aw"
    elif nearby[4] == "empty":
        return "mne"
    elif nearby[6] == "empty":
        return "mse"
    elif nearby[5] == "empty":
        return "mnw"
    elif nearby[7] == "empty":
        return "msw"
    elif nearby[0] == "empty":
        return "mn"
    elif nearby[2] == "empty":
        return "me"
    else:
        return "d"`
};
