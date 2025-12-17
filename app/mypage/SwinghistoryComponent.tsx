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

        const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_BACKEND_BASE || "http://localhost:3001").replace(/\/$/, "");
        const apiUrl = `${API_BASE}/api/result/history`;
        
        console.log("[SwinghistoryComponent] Fetching history from:", apiUrl);
        
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

  const handleDeleteJob = async (jobId: string, filename: string) => {
    // 1. 사용자 확인
    const confirmed = window.confirm(
      `정말로 "${filename}" 기록을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`
    );
    
    if (!confirmed) {
      console.log("[SwinghistoryComponent] Delete cancelled by user");
      return;
    }

    try {
      console.log("[SwinghistoryComponent] Deleting job:", jobId);
      
      // 2. 토큰 가져오기
      const idToken = localStorage.getItem("id_token");
      const accessToken = localStorage.getItem("access_token");
      const token = idToken || accessToken;

      const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_BACKEND_BASE || "http://localhost:3001").replace(/\/$/, "");
      const deleteUrl = `${API_BASE}/api/result/delete-job`;
      
      const headers: any = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // 3. 백엔드로 삭제 요청
      const response = await fetch(deleteUrl, {
        method: "DELETE",
        credentials: "include",
        headers,
        body: JSON.stringify({ job_id: jobId }),
      });

      if (response.ok) {
        console.log("[SwinghistoryComponent] Job deleted successfully");
        alert("기록이 삭제되었습니다.");
        
        // 4. 페이지 새로고침 또는 상태 업데이트
        setHistory(history.filter(item => item.job_id !== jobId));
      } else {
        const errorData = await response.json();
        console.error("[SwinghistoryComponent] Delete failed:", errorData);
        alert(`삭제 실패: ${errorData.detail || "알 수 없는 오류"}`);
      }
    } catch (err) {
      console.error("[SwinghistoryComponent] Delete error:", err);
      alert(`삭제 중 오류 발생: ${err instanceof Error ? err.message : "알 수 없는 오류"}`);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      // KST는 UTC+9
      const utcTime = date.getTime();
      const kstTime = new Date(utcTime + (9 * 60 * 60 * 1000));
      const month = String(kstTime.getMonth() + 1).padStart(2, "0");
      const day = String(kstTime.getDate()).padStart(2, "0");
      return `${month}. ${day}.`;
    } catch {
      return "-";
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      // KST는 UTC+9
      const utcTime = date.getTime();
      const kstTime = new Date(utcTime + (9 * 60 * 60 * 1000));
      
      const hours = kstTime.getHours();
      const minutes = kstTime.getMinutes();
      const seconds = kstTime.getSeconds();
      
      const ampm = hours >= 12 ? "오후" : "오전";
      const displayHour = hours % 12 || 12;
      
      return `${ampm} ${String(displayHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
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
            <div className="text-[14px] py-[20px] w-[20%] flex justify-center items-center gap-2">
              <button
                onClick={() => handleViewDetails(item.job_id, item.s3_result_path)}
                disabled={!item.s3_result_path}
                className={`flex items-center justify-center gap-2 h-11 min-w-[128px] px-4 rounded-lg transition-colors text-base font-semibold whitespace-nowrap ${
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
              
              {/* 삭제 버튼 */}
              <button
                onClick={() => handleDeleteJob(item.job_id, item.original_filename)}
                className="flex items-center justify-center h-11 px-3 rounded-lg transition-colors text-base font-semibold bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg"
                title="이 기록을 삭제합니다"
              >
                <span>삭제</span>
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
