#!/usr/bin/env node
// Validate RECON_DATA using TypeScript AST parsing (safer than regex/eval)
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const TS_FILE = path.resolve(__dirname, '../constants.ts');

function readFile(file) {
  return fs.readFileSync(file, 'utf8');
}

function findRECONDataNode(sourceFile) {
  let found = null;
  ts.forEachChild(sourceFile, function visit(node) {
    // Looking for: export const RECON_DATA: ReconSection[] = [ ... ];
    if (ts.isVariableStatement(node) && node.modifiers && node.modifiers.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
      const decl = node.declarationList.declarations[0];
      if (decl && decl.name && decl.name.escapedText === 'RECON_DATA') {
        found = decl.initializer;
      }
    }
    if (!found) ts.forEachChild(node, visit);
  });
  return found;
}

function evaluateNode(node) {
  if (!node) return null;
  switch (node.kind) {
    case ts.SyntaxKind.ArrayLiteralExpression:
      return node.elements.map(evaluateNode);
    case ts.SyntaxKind.ObjectLiteralExpression: {
      const obj = {};
      node.properties.forEach((p) => {
        if (ts.isPropertyAssignment(p)) {
          const key = getPropertyName(p.name);
          obj[key] = evaluateNode(p.initializer);
        }
      });
      return obj;
    }
    case ts.SyntaxKind.StringLiteral:
    case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
      return node.text;
    case ts.SyntaxKind.TemplateExpression: {
      // Reconstruct template if possible; fallback to raw text
      let str = '';
      // head
      if (node.head) str += node.head.text;
      node.templateSpans.forEach(span => {
        // If expression is simple literal, include; else use placeholder
        if (ts.isStringLiteral(span.expression) || ts.isNoSubstitutionTemplateLiteral(span.expression)) {
          str += span.expression.text;
        } else if (ts.isIdentifier(span.expression)) {
          str += '${' + span.expression.escapedText + '}';
        } else {
          str += '${expr}';
        }
        if (span.literal) str += span.literal.text;
      });
      return str;
    }
    case ts.SyntaxKind.PropertyAccessExpression: {
      // e.g., ContentType.COMMAND
      const pa = node;
      if (ts.isIdentifier(pa.expression) && pa.expression.escapedText === 'ContentType') {
        const prop = pa.name.escapedText.toString();
        return prop.toLowerCase();
      }
      return pa.getText();
    }
    case ts.SyntaxKind.NumericLiteral:
      return Number(node.text);
    case ts.SyntaxKind.TrueKeyword:
      return true;
    case ts.SyntaxKind.FalseKeyword:
      return false;
    default:
      return node.getText();
  }
}

function getPropertyName(nameNode) {
  if (ts.isIdentifier(nameNode)) return nameNode.escapedText.toString();
  if (ts.isStringLiteral(nameNode) || ts.isNumericLiteral(nameNode)) return nameNode.text;
  return nameNode.getText();
}

function validate() {
  const content = readFile(TS_FILE);
  const src = ts.createSourceFile('constants.ts', content, ts.ScriptTarget.Latest, true);
  const node = findRECONDataNode(src);
  if (!node) {
    console.error('Could not find RECON_DATA in constants.ts');
    process.exit(2);
  }

  const data = evaluateNode(node);
  if (!Array.isArray(data)) {
    console.error('RECON_DATA is not an array');
    process.exit(2);
  }

  const ids = new Set();
  const validTypes = ['command', 'text', 'list', 'dork_list', 'script', 'link_list'];
  let errors = 0;

  data.forEach((section, sidx) => {
    if (!section.id) {
      console.error(`Section at index ${sidx} missing id`);
      errors++;
    }
    if (!Array.isArray(section.items)) {
      console.error(`Section ${section.id || sidx} items not an array`);
      errors++;
      return;
    }
    section.items.forEach((item, idx) => {
      if (!item || !item.id) {
        console.error(`Item at section ${section.id || sidx} index ${idx} missing id`);
        errors++; return;
      }
      if (ids.has(item.id)) {
        console.error(`Duplicate id found: ${item.id}`);
        errors++;
      }
      ids.add(item.id);
      if (!item.type) {
        console.error(`Item ${item.id} missing type`);
        errors++;
      } else if (!validTypes.includes(item.type)) {
        console.error(`Invalid type for ${item.id}: ${item.type}`);
        errors++;
      }
    });
  });

  if (errors) {
    console.error(`Validation failed with ${errors} errors`);
    process.exit(1);
  }
  console.log('Validation OK — no duplicate ids and types look good.');
}

validate();
// EOF - This file uses TypeScript AST parsing; no fallback regex parser.
