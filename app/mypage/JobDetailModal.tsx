"use client";

import React, { useState, useEffect } from "react";
import ReceiveResult from "../receive/components/ReceiveResult";
import Image from "next/image";

interface JobDetailModalProps {
  jobId: string;
  s3ResultPath: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function JobDetailModal({
  jobId,
  s3ResultPath,
  isOpen,
  onClose,
}: JobDetailModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parsedResultJson, setParsedResultJson] = useState<any | null>(null);
  const [resultUrls, setResultUrls] = useState<string[] | null>(null);

  useEffect(() => {
    if (!isOpen || !jobId) return;

    const fetchJobData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 토큰 가져오기
        const idToken = localStorage.getItem("id_token");
        const accessToken = localStorage.getItem("access_token");
        const token = idToken || accessToken;

        const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_BASE || "http://localhost:3001/api"}/result/result-json?job_id=${encodeURIComponent(jobId)}`;
        
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
          throw new Error(`Failed to fetch job data: ${response.status}`);
        }

        const data = await response.json();
        
        // 응답은 직접 result.json 객체 또는 중첩된 구조일 수 있음
        const resultJson = data.result_json || data;
        setParsedResultJson(resultJson);
        
        // 결과 JSON에서 오버레이 mp4 경로들을 추출하고 presigned URL 생성
        const mp4Paths = new Set<string>();
        
        const extractMp4Paths = (obj: any) => {
          if (!obj || typeof obj !== 'object') return;
          
          if (obj.overlay_mp4 && typeof obj.overlay_mp4 === 'string') {
            mp4Paths.add(obj.overlay_mp4);
          }
          
          for (const key in obj) {
            if (typeof obj[key] === 'object') {
              extractMp4Paths(obj[key]);
            }
          }
        };
        
        extractMp4Paths(resultJson);
        
        // presigned URL 생성
        // s3ResultPath를 기반으로 실제 S3 경로 구성
        // 예: s3ResultPath = "dev-user-google-id/3d/d236ce35.../result.json" 또는 "results/dev-user-google-id/3d/d236ce35.../result.json"
        // -> 실제 mp4는 "dev-user-google-id/3d/d236ce35.../mp4/..."에 위치
        const urls: string[] = [];
        for (const path of mp4Paths) {
          try {
            let fullPath = path;
            
            if (s3ResultPath && path.startsWith('mp4/')) {
              // s3ResultPath에서 폴더 경로 추출
              let resultPath = s3ResultPath;
              
              // "results/" prefix 제거 (있다면)
              if (resultPath.startsWith('results/')) {
                resultPath = resultPath.substring('results/'.length);
              }
              
              // result.json 파일 제거
              const resultPathParts = resultPath.split('/');
              resultPathParts.pop();
              const folderPath = resultPathParts.join('/');
              
              // 실제 mp4 경로 구성
              fullPath = `${folderPath}/${path}`;
            }
            
            // 백엔드에 presigned URL 요청
            const presignedResponse = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_BASE || "http://localhost:3001/api"}/result/presigned-url?path=${encodeURIComponent(fullPath)}`,
              { 
                credentials: "include",
                headers,
              }
            );
            
            if (presignedResponse.ok) {
              const presignedData = await presignedResponse.json();
              if (presignedData.url) {
                urls.push(presignedData.url);
              }
            }
          } catch (e) {
            console.warn(`Failed to get presigned URL for ${path}:`, e);
          }
        }
        
        setResultUrls(urls.length > 0 ? urls : null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load job data");
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [isOpen, jobId]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 dark:bg-opacity-75 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
                <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex justify-between items-center">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              스윙 분석 결과
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Job ID: {jobId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f8552] dark:border-[#4ade80] mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">데이터 로딩 중...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <p className="text-red-500 dark:text-red-400 font-medium">{error}</p>
              </div>
            </div>
          ) : parsedResultJson ? (
            <div className="space-y-6">
              <ReceiveResult
                parsedJson={parsedResultJson}
                resultUrls={resultUrls}
                resultContents={null}
              />
            </div>
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-600 dark:text-gray-400">
                데이터를 불러올 수 없습니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
