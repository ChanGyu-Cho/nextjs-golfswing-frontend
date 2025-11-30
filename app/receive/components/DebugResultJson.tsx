"use client";

import React, { useState } from "react";

type Props = {
  resultJson: any;
  enabled?: boolean;
};

/**
 * DebugResultJson Component
 * 
 * Displays the raw resultJson in a scrollable container for debugging purposes.
 * Can be easily toggled on/off and removed via the `enabled` prop.
 * 
 * Usage for production removal:
 * 1. Set enabled={false} to hide
 * 2. Remove the component from ReceiveResult.tsx entirely
 */
export default function DebugResultJson({ resultJson, enabled = true }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!enabled || !resultJson) return null;

  const jsonString = JSON.stringify(resultJson, null, 2);

  return (
    <div className="mt-8 pt-8 border-t border-slate-300 dark:border-slate-600">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          {isExpanded ? "▼" : "▶"} Debug: Result JSON
        </button>
        <span className="text-xs text-gray-500 dark:text-slate-400">
          (개발 환경용 - 본 서비스 배포 시 이 컴포넌트를 제거하세요)
        </span>
      </div>

      {isExpanded && (
        <div className="mt-4 border border-slate-300 dark:border-slate-600 rounded overflow-hidden bg-white dark:bg-slate-800">
          <div className="max-h-96 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4">
            <pre className="text-xs text-black dark:text-slate-200 font-mono whitespace-pre-wrap break-words">
              {jsonString}
            </pre>
          </div>
          <div className="bg-slate-100 dark:bg-slate-700 px-4 py-2 text-xs text-gray-600 dark:text-slate-300 border-t border-slate-300 dark:border-slate-600">
            <span>JSON 크기: {(jsonString.length / 1024).toFixed(2)} KB</span>
          </div>
        </div>
      )}
    </div>
  );
}
