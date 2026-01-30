import React, { useState, useRef } from "react";
import Papa from "papaparse";
import { Upload, FileCheck, AlertCircle, FileSpreadsheet } from "lucide-react";

/**
 * AMEX statement CSV importer.
 * Requires columns:
 * - Date
 * - Amount
 * - Appears On Your Statement As OR Description
 */

function tryParseDate(value) {
  const s = String(value || "").trim();
  if (!s) return null;
  // ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // DD/MM/YYYY (AU default)
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const dd = String(Number(m[1])).padStart(2, "0");
    const mm = String(Number(m[2])).padStart(2, "0");
    const yyyy = String(Number(m[3]));
    return `${yyyy}-${mm}-${dd}`;
  }
  // fallback
  const t = Date.parse(s);
  if (!Number.isNaN(t)) {
    const d = new Date(t);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  return null;
}

function parseAmount(value) {
  const raw = String(value || "").trim();
  if (!raw) return 0;
  const neg = raw.includes("(") && raw.includes(")");
  const cleaned = raw.replace(/[()]/g, "").replace(/[$,]/g, "").trim();
  const n = Number(cleaned);
  if (Number.isNaN(n)) return 0;
  return neg ? -Math.abs(n) : n;
}

export default function AmexCsvImport({ onImport }) {
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [parsedCount, setParsedCount] = useState(0);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    setError("");
    setParsedCount(0);
    setFileName(file?.name || "");

    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data || [];
        const fields = results.meta?.fields || [];

        if (!fields.length || !rows.length) {
          setError("CSV looks empty or headers were not detected.");
          return;
        }

        if (!fields.includes("Date") || !fields.includes("Amount")) {
          setError(
            `Missing required columns. Expected "Date" and "Amount". Found: ${fields.join(", ")}`
          );
          return;
        }

        const descCol = fields.includes("Appears On Your Statement As")
          ? "Appears On Your Statement As"
          : fields.includes("Description")
            ? "Description"
            : null;

        if (!descCol) {
          setError(
            `Missing description column. Expected "Appears On Your Statement As" or "Description".`
          );
          return;
        }

        const out = [];

        for (const row of rows) {
          const date = tryParseDate(row["Date"]);
          const amount = parseAmount(row["Amount"]);
          const description = String(row[descCol] || "").trim();

          if (!date || !description) continue;

          out.push({
            date,
            amount,
            description,
            merchant: description,
            reference: String(row["Reference"] || "").trim() || null,
            card: String(row["Card Member"] || "").trim() || null,
            country: String(row["Country"] || "").trim() || null,
            account: String(row["Account #"] || "").trim() || null,
          });
        }

        if (!out.length) {
          setError("No valid rows found after parsing.");
          return;
        }

        setParsedCount(out.length);
        onImport?.(out);
      },
      error: (e) => setError(e?.message || "Failed to parse CSV."),
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <FileSpreadsheet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Import Transaction Data</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Supports AMEX CSV format.
            </p>
          </div>
        </div>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {fileName ? "Change File" : "Click to Upload CSV"}
            </div>
            {!fileName && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                or drag and drop here
              </p>
            )}
          </div>
        </div>

        {fileName && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 flex items-center justify-between border border-gray-100 dark:border-gray-600">
            <div className="flex items-center gap-2 overflow-hidden">
              <FileCheck className="w-4 h-4 text-green-500 shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-200 truncate">{fileName}</span>
            </div>
            {parsedCount > 0 && (
              <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded">
                {parsedCount} Parsed
              </span>
            )}
          </div>
        )}

        {error ? (
          <div className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        ) : null}

        <div className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
          Expected columns: Date, Amount, Description/Appears On Your Statement As
        </div>
      </div>
    </div>
  );
}
