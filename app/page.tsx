"use client";

import { useCallback, useRef, useState } from "react";
import { prettifyJSON } from "@/lib/prettify";

type Status = "idle" | "success" | "error";

export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fileName, setFileName] = useState("prettified.json");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCleanUp = useCallback(() => {
    const raw = input.trim();
    if (!raw) {
      setErrorMsg("Please paste or upload some JSON first.");
      setStatus("error");
      return;
    }
    try {
      setOutput(prettifyJSON(raw));
      setStatus("success");
      setErrorMsg("");
    } catch (e: unknown) {
      setOutput("");
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Invalid JSON");
    }
  }, [input]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setFileName(file.name.replace(/\.json$/i, "") + "-prettified.json");
      const reader = new FileReader();
      reader.onload = (ev) => {
        setInput((ev.target?.result as string) ?? "");
        setStatus("idle");
        setOutput("");
      };
      reader.readAsText(file);
    },
    []
  );

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }, [output, fileName]);

  const handleCopy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setStatus("idle");
    setErrorMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setFileName(file.name.replace(/\.json$/i, "") + "-prettified.json");
    const reader = new FileReader();
    reader.onload = (ev) => {
      setInput((ev.target?.result as string) ?? "");
      setStatus("idle");
      setOutput("");
    };
    reader.readAsText(file);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <span className="text-2xl font-bold tracking-tight text-white">
          JSON <span className="text-emerald-400">Nice</span>
        </span>
        <span className="text-gray-500 text-sm mt-0.5">
          — format &amp; expand stringified JSON
        </span>
      </header>

      {/* Main */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-800">
        {/* Input panel */}
        <section className="flex flex-col p-6 gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
              Input
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors cursor-pointer"
              >
                <UploadIcon />
                Upload JSON
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleFileUpload}
              />
              {input && (
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <ClearIcon />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Drop zone / textarea */}
          <div
            className="relative flex-1"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setStatus("idle");
                setOutput("");
              }}
              placeholder={`Paste JSON here…\n\nOr drag & drop a .json file onto this area.`}
              spellCheck={false}
              className="w-full h-full min-h-[400px] lg:min-h-0 resize-none rounded-lg bg-gray-900 border border-gray-700 text-gray-200 text-sm font-mono p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-600 transition-colors"
            />
          </div>

          {/* Error */}
          {status === "error" && (
            <div className="flex items-start gap-2 rounded-lg bg-red-950 border border-red-800 px-4 py-3 text-sm text-red-300">
              <ErrorIcon />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Clean up button */}
          <button
            onClick={handleCleanUp}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-gray-950 font-semibold text-sm transition-colors cursor-pointer shadow-lg shadow-emerald-900/40"
          >
            <BroomIcon />
            Clean up
          </button>
        </section>

        {/* Output panel */}
        <section className="flex flex-col p-6 gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
              Output
            </h2>
            {output && (
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors cursor-pointer"
                >
                  <CopyIcon />
                  Copy
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-800 text-emerald-200 hover:bg-emerald-700 hover:text-white transition-colors cursor-pointer"
                >
                  <DownloadIcon />
                  Download JSON
                </button>
              </div>
            )}
          </div>

          <div className="relative flex-1">
            {output ? (
              <pre className="w-full h-full min-h-[400px] lg:min-h-0 overflow-auto rounded-lg bg-gray-900 border border-gray-700 text-sm font-mono p-4 text-gray-200 leading-relaxed">
                <ColorizedJSON json={output} />
              </pre>
            ) : (
              <div className="w-full h-full min-h-[400px] lg:min-h-0 rounded-lg bg-gray-900 border border-dashed border-gray-700 flex items-center justify-center text-gray-600 text-sm">
                Your formatted JSON will appear here.
              </div>
            )}
          </div>

          {output && (
            <p className="text-xs text-gray-600">
              {output.split("\n").length.toLocaleString()} lines ·{" "}
              {(new Blob([output]).size / 1024).toFixed(1)} KB
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

/* Syntax-highlight JSON without a dependency */
function ColorizedJSON({ json }: { json: string }) {
  const parts: React.ReactNode[] = [];
  const tokenRe =
    /("(?:[^"\\]|\\.)*")\s*(:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(\btrue\b|\bfalse\b|\bnull\b)|([{}[\],])/g;

  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRe.exec(json)) !== null) {
    if (match.index > last) {
      parts.push(json.slice(last, match.index));
    }

    const [full, str, colon, num, kw, punct] = match;

    if (str) {
      if (colon) {
        // object key
        parts.push(
          <span key={match.index} className="text-sky-300">
            {str}
          </span>,
          <span key={match.index + "c"} className="text-gray-400">
            :
          </span>
        );
      } else {
        // string value
        parts.push(
          <span key={match.index} className="text-amber-300">
            {str}
          </span>
        );
      }
    } else if (num) {
      parts.push(
        <span key={match.index} className="text-purple-300">
          {num}
        </span>
      );
    } else if (kw) {
      parts.push(
        <span key={match.index} className="text-rose-400">
          {kw}
        </span>
      );
    } else if (punct) {
      parts.push(
        <span key={match.index} className="text-gray-500">
          {punct}
        </span>
      );
    } else {
      parts.push(full);
    }

    last = match.index + full.length;
  }

  if (last < json.length) parts.push(json.slice(last));

  return <>{parts}</>;
}

/* Icons */
function UploadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function BroomIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21l8-8" />
      <path d="M12.5 7.5l-1 1" />
      <path d="M18 3l3 3-9.5 9.5-4-1L18 3z" />
      <path d="M7 17l-4 4" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

