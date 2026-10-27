/**
 * Minimal, dependency-free .xlsx writer.
 *
 * An .xlsx file is a ZIP of SpreadsheetML parts. We write the parts ourselves
 * and pack them with the ZIP "stored" method (no compression), which every
 * spreadsheet app reads. Enough for tabular reports: typed cells, a bold frozen
 * header with filters, column widths, number/money/date formats, a totals row.
 */

export type XlsxCell = string | number | boolean | Date | null | undefined;
export type XlsxCellFormat = "text" | "number" | "money" | "date" | "datetime";

export interface XlsxSheet {
  name: string;
  headers: string[];
  rows: XlsxCell[][];
  formats?: XlsxCellFormat[];
  widths?: number[];
  /** Column indexes to total in a final row. */
  totals?: number[];
}

// Style ids defined in styles.xml below.
const STYLE = { text: 0, header: 1, number: 2, money: 3, date: 4, datetime: 5, totalLabel: 6, totalMoney: 7, totalNumber: 8 } as const;

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    // Strip characters XML 1.0 forbids (they corrupt the file).
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");

const columnLetter = (index: number) => {
  let n = index + 1;
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
};

/** Excel serial date (days since 1899-12-30), using local calendar fields. */
const excelDate = (d: Date) =>
  (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()) - Date.UTC(1899, 11, 30)) / 86_400_000;

const safeSheetName = (name: string) => (name.replace(/[[\]:*?/\\]/g, " ").trim() || "Sheet1").slice(0, 31);

function cellXml(ref: string, value: XlsxCell, format: XlsxCellFormat, style?: number): string {
  // Blank cells are written explicitly: some readers (e.g. macOS Quick Look)
  // stop rendering at a row whose first cell is omitted.
  const blank = `<c r="${ref}"${style ? ` s="${style}"` : ""}/>`;
  if (value === null || value === undefined || value === "") return blank;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return blank;
    const s = style ?? (format === "datetime" ? STYLE.datetime : STYLE.date);
    return `<c r="${ref}" s="${s}"><v>${excelDate(value)}</v></c>`;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const s = style ?? (format === "money" ? STYLE.money : format === "number" ? STYLE.number : STYLE.text);
    return `<c r="${ref}" s="${s}"><v>${value}</v></c>`;
  }
  if (typeof value === "boolean") {
    return `<c r="${ref}" t="inlineStr"${style ? ` s="${style}"` : ""}><is><t>${value ? "Yes" : "No"}</t></is></c>`;
  }
  return `<c r="${ref}" t="inlineStr"${style ? ` s="${style}"` : ""}><is><t xml:space="preserve">${escapeXml(String(value))}</t></is></c>`;
}

function sheetXml(sheet: XlsxSheet): string {
  const formats = sheet.formats ?? [];
  const colCount = sheet.headers.length;
  const lastCol = columnLetter(colCount - 1);
  const dataRows = sheet.rows.length;

  const cols = sheet.headers
    .map((h, i) => {
      const sample = sheet.rows.slice(0, 200).map((r) => {
        const v = r[i];
        if (v instanceof Date) return formats[i] === "datetime" ? 18 : 13;
        if (typeof v === "number") return String(Math.round(v)).length + 6;
        return String(v ?? "").length + 2;
      });
      const width = sheet.widths?.[i] ?? Math.min(60, Math.max(10, h.length + 2, ...sample));
      return `<col min="${i + 1}" max="${i + 1}" width="${width}" customWidth="1"/>`;
    })
    .join("");

  const header = `<row r="1">${sheet.headers.map((h, i) => cellXml(`${columnLetter(i)}1`, h, "text", STYLE.header)).join("")}</row>`;

  const body = sheet.rows
    .map((row, r) => `<row r="${r + 2}">${row.map((v, c) => cellXml(`${columnLetter(c)}${r + 2}`, v, formats[c] ?? "text")).join("")}</row>`)
    .join("");

  let totals = "";
  if (sheet.totals?.length && dataRows > 0) {
    const r = dataRows + 2;
    const cells = sheet.headers.map((_, c) => {
      const ref = `${columnLetter(c)}${r}`;
      if (c === 0 && !sheet.totals!.includes(0)) return cellXml(ref, "Total", "text", STYLE.totalLabel);
      if (!sheet.totals!.includes(c)) return cellXml(ref, null, "text", STYLE.totalLabel);
      const sum = sheet.rows.reduce((acc, row) => acc + (typeof row[c] === "number" ? (row[c] as number) : 0), 0);
      const style = formats[c] === "money" ? STYLE.totalMoney : STYLE.totalNumber;
      return `<c r="${ref}" s="${style}"><f>SUM(${columnLetter(c)}2:${columnLetter(c)}${dataRows + 1})</f><v>${sum}</v></c>`;
    });
    totals = `<row r="${r}">${cells.join("")}</row>`;
  }

  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
    `<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>` +
    `<cols>${cols}</cols>` +
    `<sheetData>${header}${body}${totals}</sheetData>` +
    (dataRows > 0 ? `<autoFilter ref="A1:${lastCol}${dataRows + 1}"/>` : "") +
    `</worksheet>`
  );
}

const STYLES_XML =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
  `<numFmts count="3"><numFmt numFmtId="164" formatCode="#,##0.00"/><numFmt numFmtId="165" formatCode="d mmm yyyy"/><numFmt numFmtId="166" formatCode="d mmm yyyy h:mm"/></numFmts>` +
  `<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts>` +
  `<fills count="4"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>` +
  `<fill><patternFill patternType="solid"><fgColor rgb="FF212121"/><bgColor indexed="64"/></patternFill></fill>` +
  `<fill><patternFill patternType="solid"><fgColor rgb="FFF5E9D3"/><bgColor indexed="64"/></patternFill></fill></fills>` +
  `<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left/><right/><top style="thin"><color rgb="FFBC8552"/></top><bottom/><diagonal/></border></borders>` +
  `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
  `<cellXfs count="9">` +
  `<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>` + // 0 text
  `<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>` + // 1 header
  `<xf numFmtId="3" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>` + // 2 number
  `<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>` + // 3 money
  `<xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>` + // 4 date
  `<xf numFmtId="166" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>` + // 5 datetime
  `<xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1"/>` + // 6 total label
  `<xf numFmtId="164" fontId="0" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1"/>` + // 7 total money
  `<xf numFmtId="3" fontId="0" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1"/>` + // 8 total number
  `</cellXfs></styleSheet>`;

// ---- ZIP (stored) ------------------------------------------------------------

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

const crc32 = (bytes: Uint8Array) => {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};

function zipStored(files: Array<{ name: string; data: string }>): Blob {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const name = encoder.encode(file.name);
    const data = encoder.encode(file.data);
    const crc = crc32(data);

    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true); // version needed
    local.setUint16(6, 0x0800, true); // UTF-8 names
    local.setUint16(8, 0, true); // stored
    local.setUint32(14, crc, true);
    local.setUint32(18, data.length, true);
    local.setUint32(22, data.length, true);
    local.setUint16(26, name.length, true);
    chunks.push(new Uint8Array(local.buffer), name, data);

    const entry = new DataView(new ArrayBuffer(46));
    entry.setUint32(0, 0x02014b50, true);
    entry.setUint16(4, 20, true);
    entry.setUint16(6, 20, true);
    entry.setUint16(8, 0x0800, true);
    entry.setUint16(10, 0, true);
    entry.setUint32(16, crc, true);
    entry.setUint32(20, data.length, true);
    entry.setUint32(24, data.length, true);
    entry.setUint16(28, name.length, true);
    entry.setUint32(42, offset, true);
    central.push(new Uint8Array(entry.buffer), name);

    offset += 30 + name.length + data.length;
  }

  const centralSize = central.reduce((n, c) => n + c.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, offset, true);

  // Cast: newer TS libs type Uint8Array generically over ArrayBufferLike.
  return new Blob([...chunks, ...central, new Uint8Array(end.buffer)] as BlobPart[], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export function buildXlsx(sheet: XlsxSheet): Blob {
  const name = escapeXml(safeSheetName(sheet.name));

  return zipStored([
    {
      name: "[Content_Types].xml",
      data:
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
        `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
        `<Default Extension="xml" ContentType="application/xml"/>` +
        `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
        `<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
        `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>` +
        `</Types>`,
    },
    {
      name: "_rels/.rels",
      data:
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>` +
        `</Relationships>`,
    },
    {
      name: "xl/workbook.xml",
      data:
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
        `<sheets><sheet name="${name}" sheetId="1" r:id="rId1"/></sheets>` +
        (sheet.rows.length ? `<definedNames><definedName name="_xlnm._FilterDatabase" localSheetId="0" hidden="1">'${name.replace(/'/g, "''")}'!$A$1:$${columnLetter(sheet.headers.length - 1)}$${sheet.rows.length + 1}</definedName></definedNames>` : "") +
        `</workbook>`,
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      data:
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>` +
        `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
        `</Relationships>`,
    },
    { name: "xl/styles.xml", data: STYLES_XML },
    { name: "xl/worksheets/sheet1.xml", data: sheetXml(sheet) },
  ]);
}
