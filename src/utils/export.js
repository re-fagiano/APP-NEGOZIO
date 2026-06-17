const CSV_FORMULA_PREFIX = /^[=+\-@\t\r]/;

export function toCsv(rows, headers) {
  const escape = (value) => {
    const text = neutralizeSpreadsheetFormula(String(value ?? ''));
    return /[";\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  };
  return [headers.join(';'), ...rows.map((row) => headers.map((key) => escape(row[key])).join(';'))].join('\n');
}

export function neutralizeSpreadsheetFormula(text) {
  return CSV_FORMULA_PREFIX.test(text) ? `'${text}` : text;
}

export function downloadText(filename, content, type = 'application/json') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
