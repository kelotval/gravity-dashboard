import React, { useState, useRef } from "react";
import Papa from "papaparse";
import {
  Upload,
  FileCheck,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle,
  Calendar,
} from "lucide-react";

/**
 * AMEX statement CSV importer with statement-aware period selection.
 * Requires columns:
 * - Date
 * - Amount
 * - Appears On Your Statement As OR Description
 */

// --- Helper Functions ---
function tryParseDate(value) {
  const s = String(value || "").trim();
  if (!s) return null;

  // ISO format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return s;
  }

  // Parse DD/MM/YYYY or MM/DD/YYYY format
  const parts = s.split(/[-\/]/);
  if (parts.length === 3) {
    const [a, b, c] = parts.map(Number);
    let yyyy, mm, dd;

    if (a > 1000) {
      // YYYY-MM-DD or YYYY/MM/DD
      [yyyy, mm, dd] = [a, b, c];
    } else if (c > 1000) {
      // DD/MM/YYYY or MM/DD/YYYY - assume DD/MM for Australian context
      dd = a;
      mm = b;
      yyyy = c;
    } else {
      return null;
    }

    // Validate ranges
    if (yyyy >= 2000 && yyyy <= 2100 && mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
      return `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
    }
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

function isIgnoredPaymentLine(description) {
  const d = String(description || "").toLowerCase();
  // Your rule: ignore AMEX statement payment lines
  return d.includes("direct debit received - thank you");
}

/**
 * AMEX Normalization:
 * Keep the AMEX export convention as-is (positive = expenses, negative = refunds/payments)
 * The app's inferTransactionKind function handles this convention correctly
 */
function normalizeAmexAmount(rawAmount, description) {
  if (isIgnoredPaymentLine(description)) {
    return { skip: true, normalized: 0, kind: "payment" };
  }

  // Purchases (positive) → keep positive, mark as expense
  if (rawAmount > 0) {
    return { skip: false, normalized: rawAmount, kind: "expense" };
  }

  // Refunds/Payments (negative) → keep negative, mark as refund
  if (rawAmount < 0) {
    return { skip: false, normalized: rawAmount, kind: "refund" };
  }

  return { skip: false, normalized: 0, kind: "expense" };
}

export default function AmexCsvImport({ onImport }) {
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const availablePeriods = React.useMemo(() => {
    const periods = [];
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const periodKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      periods.push(periodKey);
    }
    return periods;
  }, []);

  const handleFile = (file) => {
    setError("");
    setParsedData(null);
    setPreview(null);
    setFileName(file?.name || "");

    if (!file) return;

    if (!selectedPeriod) {
      setError("Please select a Statement Month before uploading.");
      return;
    }

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
            `Missing required columns. Expected "Date" and "Amount". Found: ${fields.join(
              ", "
            )}`
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
        let ignoredPaymentsCount = 0;
        let ignoredPaymentsTotal = 0;

        for (const row of rows) {
          const date = tryParseDate(row["Date"]);
          const rawAmount = parseAmount(row["Amount"]);
          const description = String(row[descCol] || "").trim();

          if (!date || !description) continue;

          const norm = normalizeAmexAmount(rawAmount, description);

          if (norm.skip) {
            ignoredPaymentsCount += 1;
            ignoredPaymentsTotal += Math.abs(rawAmount);
            continue;
          }

          out.push({
            date,
            amount: norm.normalized,
            description,
            merchant: description,
            periodKey: selectedPeriod,
            reference: String(row["Reference"] || "").trim() || null,
            card: String(row["Card Member"] || "").trim() || null,
            country: String(row["Country"] || "").trim() || null,
            account: String(row["Account #"] || "").trim() || null,
            kind: norm.kind,
            rawAmount,
          });
        }

        if (!out.length) {
          setError("No valid rows found after parsing.");
          return;
        }

        // Preview summary
        let grossPurchases = 0;
        let refunds = 0;

        for (const tx of out) {
          const amt = tx.amount;
          if (amt < 0) grossPurchases += Math.abs(amt);
          if (amt > 0) refunds += amt;
        }

        const netSpend = grossPurchases - refunds;

        setParsedData(out);
        setPreview({
          grossPurchases,
          refunds,
          payments: ignoredPaymentsTotal,
          transfers: 0,
          netSpend,
          totalCount: out.length,
          duplicatesSkipped: 0,
          ignoredPaymentsCount,
        });
      },
      error: (e) => setError(e?.message || "Failed to parse CSV."),
    });
  };

  const handleConfirm = () => {
    if (!parsedData) return;
    onImport?.(parsedData);

    setParsedData(null);
    setPreview(null);
    setFileName("");
    setSelectedPeriod("");

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCancel = () => {
    setParsedData(null);
    setPreview(null);
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.05] rounded-2xl shadow-sm backdrop-blur-[2px] p-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <FileSpreadsheet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Import Transaction Data
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Supports AMEX CSV format. Select statement month first.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Statement Month (Required)
          </label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            style={{ colorScheme: "dark" }}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            disabled={!!parsedData}
          >
            <option value="" className="dark:bg-gray-800">Select statement month...</option>
            {availablePeriods.map((p) => (
              <option key={p} value={p} className="dark:bg-gray-800">
                {p}
              </option>
            ))}
          </select>
        </div>

        {!parsedData && (
          <div
            onClick={() => selectedPeriod && fileInputRef.current?.click()}
            className={`border-2 border-dashed ${selectedPeriod
              ? "border-gray-200 dark:border-gray-600 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              : "border-gray-100 dark:border-gray-700 cursor-not-allowed opacity-50"
              } rounded-xl p-6 text-center transition-all group`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => handleFile(e.target.files?.[0])}
              className="hidden"
              disabled={!selectedPeriod}
            />

            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-sm font-medium text-white">
                {selectedPeriod ? "Click to Upload CSV" : "Select month first"}
              </div>
              {selectedPeriod && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  or drag and drop here
                </p>
              )}
            </div>
          </div>
        )}

        {fileName && !parsedData && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 flex items-center justify-between border border-gray-100 dark:border-gray-600">
            <div className="flex items-center gap-2 overflow-hidden">
              <FileCheck className="w-4 h-4 text-green-500 shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-200 truncate">
                {fileName}
              </span>
            </div>
          </div>
        )}

        {preview && (
          <div className="bg-blue-500/[0.05] border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-blue-400" />
              <h4 className="text-sm font-bold text-blue-300">
                Preview Summary - {selectedPeriod}
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/[0.03] p-2 rounded border border-white/5">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Gross Purchases
                </div>
                <div className="font-bold text-white">
                  ${preview.grossPurchases.toFixed(2)}
                </div>
              </div>
              <div className="bg-white/[0.03] p-2 rounded border border-white/5">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Refunds
                </div>
                <div className="font-bold text-emerald-600 dark:text-emerald-400">
                  ${preview.refunds.toFixed(2)}
                </div>
              </div>
              <div className="bg-white/[0.03] p-2 rounded border border-white/5">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Ignored Payments (AMEX)
                </div>
                <div className="font-bold text-blue-600 dark:text-blue-400">
                  ${preview.payments.toFixed(2)}
                </div>
              </div>
              <div className="bg-white/[0.03] p-2 rounded border border-white/5">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Transfers
                </div>
                <div className="font-bold text-purple-600 dark:text-purple-400">
                  ${preview.transfers.toFixed(2)}
                </div>
              </div>
              <div className="bg-white/[0.03] p-2 rounded border border-white/5 col-span-2">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Net Spend
                </div>
                <div className="font-bold text-lg text-white">
                  ${preview.netSpend.toFixed(2)}
                </div>
              </div>
              <div className="bg-white/[0.03] p-2 rounded border border-white/5">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Transactions
                </div>
                <div className="font-bold text-white">
                  {preview.totalCount}
                </div>
              </div>
              <div className="bg-white/[0.03] p-2 rounded border border-white/5">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Duplicates Skipped
                </div>
                <div className="font-bold text-yellow-600 dark:text-yellow-400">
                  {preview.duplicatesSkipped}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Confirm Import
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {error ? (
          <div className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        ) : null}

        {!preview && (
          <div className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
            Expected columns: Date, Amount, Description/Appears On Your Statement As
          </div>
        )}
      </div>
    </div>
  );
}
