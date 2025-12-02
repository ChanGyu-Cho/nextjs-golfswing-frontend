"use client";

import React, { useState, useEffect } from "react";
import JobDetailModal from "./JobDetailModal";
import Image from "next/image";

interface HistoryItem {
  job_id: string;
  upload_time: string;
  processing_status: string;
  s3_result_path: string | null;
  upload_source: string;
  original_filename: string;
  file_size_bytes: number;
}

function SwinghistoryComponent() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedS3ResultPath, setSelectedS3ResultPath] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // 토큰 가져오기
        const idToken = localStorage.getItem("id_token");
        const accessToken = localStorage.getItem("access_token");
        const token = idToken || accessToken;

        const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_BASE || "http://localhost:3001/api"}/result/history`;
        
        const headers: any = {
          "Content-Type": "application/json",
        };
        
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(apiUrl, {
          credentials: "include",
          headers,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch history: ${response.status}`);
        }

        const data = await response.json();
        setHistory(data.history || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load history");
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleViewDetails = (jobId: string, s3ResultPath: string | null) => {
    setSelectedJobId(jobId);
    setSelectedS3ResultPath(s3ResultPath);
    setIsModalOpen(true);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("ko-KR", {
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      PENDING: { text: "대기 중", color: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200" },
      PROCESSING: { text: "처리 중", color: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200" },
      COMPLETED: { text: "완료", color: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" },
      FAILED: { text: "실패", color: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200" },
    };

    const info = statusMap[status] || { text: status, color: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200" };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${info.color}`}>
        {info.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="pt-[50px] flex flex-col">
        <div className="text-[24px] text-[#1f8552] dark:text-[#4ade80] font-bold">스윙 기록</div>
        <div className="pt-[20px] flex justify-center items-center h-[200px]">
          <div className="text-gray-500 dark:text-gray-400">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-[50px] flex flex-col">
        <div className="text-[24px] text-[#1f8552] dark:text-[#4ade80] font-bold">스윙 기록</div>
        <div className="pt-[20px] flex justify-center items-center h-[200px]">
          <div className="text-red-500 dark:text-red-400">{error}</div>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="pt-[50px] flex flex-col">
        <div className="text-[24px] text-[#1f8552] dark:text-[#4ade80] font-bold">스윙 기록</div>
        <div className="pt-[20px] flex justify-center items-center h-[200px]">
          <div className="text-gray-500 dark:text-gray-400">기록이 없습니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[50px] flex flex-col">
      <div className="text-[24px] text-[#1f8552] dark:text-[#4ade80] font-bold">스윙 기록</div>
      <div className="pt-[20px] overflow-x-auto">
        {/* header */}
        <div className="border-y border-gray-300 dark:border-slate-600 flex flex-row min-w-[1000px]">
          <div className="text-[14px] text-gray-600 dark:text-gray-400 py-[15px] w-[11%] text-center font-semibold">
            날짜
          </div>
          <div className="text-[14px] text-gray-600 dark:text-gray-400 py-[15px] w-[11%] text-center font-semibold">
            시간
          </div>
          <div className="text-[14px] text-gray-600 dark:text-gray-400 py-[15px] w-[14%] text-center font-semibold">
            파일명
          </div>
          <div className="text-[14px] text-gray-600 dark:text-gray-400 py-[15px] w-[11%] text-center font-semibold">
            상태
          </div>
          <div className="text-[14px] text-gray-600 dark:text-gray-400 py-[15px] w-[13%] text-center font-semibold">
            출처
          </div>
          <div className="text-[14px] text-gray-600 dark:text-gray-400 py-[15px] w-[20%] text-center font-semibold">
            결과
          </div>
          <div className="text-[14px] text-gray-600 dark:text-gray-400 py-[15px] w-[20%] text-center font-semibold">
            자세히
          </div>
        </div>

        {/* body rows */}
        {history.map((item) => (
          <div
            key={item.job_id}
            className="border-b border-gray-300 dark:border-slate-600 flex flex-row min-w-[1000px] hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="text-[14px] text-gray-800 dark:text-gray-200 font-medium py-[20px] w-[11%] flex justify-center items-center">
              {formatDate(item.upload_time)}
            </div>
            <div className="text-[14px] text-gray-800 dark:text-gray-200 font-medium py-[20px] w-[11%] flex justify-center items-center">
              {formatTime(item.upload_time)}
            </div>
            <div className="text-[13px] text-gray-700 dark:text-gray-300 py-[20px] w-[14%] flex justify-center items-center truncate px-2">
              {item.original_filename}
            </div>
            <div className="text-[14px] py-[20px] w-[11%] flex justify-center items-center">
              {getStatusBadge(item.processing_status)}
            </div>
            <div className="text-[13px] text-gray-700 dark:text-gray-300 font-medium py-[20px] w-[13%] flex justify-center items-center">
              {item.upload_source}
            </div>
            <div className="text-[13px] text-gray-700 dark:text-gray-300 py-[20px] w-[20%] flex justify-center items-center">
              {item.s3_result_path ? (
                <span className="text-green-600 dark:text-green-400 font-medium">완료</span>
              ) : item.processing_status === "COMPLETED" ? (
                <span className="text-yellow-600 dark:text-yellow-400 font-medium">처리 중</span>
              ) : (
                <span className="text-gray-500 dark:text-gray-400">-</span>
              )}
            </div>
            <div className="text-[14px] py-[20px] w-[20%] flex justify-center items-center">
              <button
                onClick={() => handleViewDetails(item.job_id, item.s3_result_path)}
                disabled={!item.s3_result_path}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors text-base font-semibold whitespace-nowrap ${
                  item.s3_result_path
                    ? "bg-[#1f8552] dark:bg-[#4ade80] text-white dark:text-slate-900 hover:bg-[#187a47] dark:hover:bg-[#22c55e] shadow-md hover:shadow-lg"
                    : "bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed"
                }`}
              >
                <Image
                  src="/images/icon_btn_right.png"
                  width={24}
                  height={24}
                  alt="view"
                  className="dark:invert"
                />
                <span>자세히 보기</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for job details */}
      {isModalOpen && selectedJobId && (
        <JobDetailModal
          jobId={selectedJobId}
          s3ResultPath={selectedS3ResultPath}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedJobId(null);
            setSelectedS3ResultPath(null);
          }}
        />
      )}
    </div>
  );
}

export default SwinghistoryComponent;
