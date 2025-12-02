"use client";
import React, { useState, useEffect } from "react";
import SwinghistoryComponent from "./SwinghistoryComponent";
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

function page() {
  const [userName, setUserName] = useState<string>("사용자");
  const [userEmail, setUserEmail] = useState<string>("-");
  const [userId, setUserId] = useState<string>("-");
  const [latestMetrics, setLatestMetrics] = useState<any>(null);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    // 사용자 정보 및 최근 기록 가져오기
    const fetchUserData = async () => {
      try {
        let token = null;
        
        // 1. 토큰 가져오기
        const idToken = localStorage.getItem("id_token");
        const accessToken = localStorage.getItem("access_token");
        token = idToken || accessToken;

        const headers: any = {
          "Content-Type": "application/json",
        };
        
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        // 1. 사용자 정보 API에서 가져오기
        try {
          const userInfoUrl = `${process.env.NEXT_PUBLIC_BACKEND_BASE || "http://localhost:3001/api"}/auth/me`;
          const userInfoResponse = await fetch(userInfoUrl, {
            credentials: "include",
            headers,
          });

          if (userInfoResponse.ok) {
            const userInfo = await userInfoResponse.json();
            setUserName(userInfo.name || userInfo.email || "사용자");
            setUserEmail(userInfo.email || "-");
            setUserId(userInfo.user_id || "-");
            console.log("[mypage] User info fetched:", userInfo);
          } else {
            // 폴백: 토큰에서 사용자 정보 추출
            if (idToken) {
              try {
                const decoded = JSON.parse(atob(idToken.split(".")[1]));
                setUserName(decoded.name || decoded.email || "사용자");
                setUserEmail(decoded.email || "-");
                setUserId(decoded.sub || "-");
              } catch (_) {}
            }
          }
        } catch (err) {
          console.error("Failed to fetch user info:", err);
          // 폴백: 토큰에서 사용자 정보 추출
          if (idToken) {
            try {
              const decoded = JSON.parse(atob(idToken.split(".")[1]));
              setUserName(decoded.name || decoded.email || "사용자");
              setUserEmail(decoded.email || "-");
              setUserId(decoded.sub || "-");
            } catch (_) {}
          }
        }

        // 2. 최근 스윙 기록 가져오기
        const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_BASE || "http://localhost:3001/api"}/result/history`;
        
        const response = await fetch(apiUrl, {
          credentials: "include",
          headers,
        });

        if (response.ok) {
          const data = await response.json();
          const history: HistoryItem[] = data.history || [];
          
          // 최근 기록에서 메트릭 추출
          if (history.length > 0) {
            const latestRecord = history[0];
            
            // 최근 기록이 완료되었는지 확인
            if (latestRecord.s3_result_path) {
              try {
                // result.json 가져오기
                const resultUrl = `${process.env.NEXT_PUBLIC_BACKEND_BASE || "http://localhost:3001/api"}/result/result-json?job_id=${encodeURIComponent(latestRecord.job_id)}`;
                const resultResponse = await fetch(resultUrl, {
                  credentials: "include",
                  headers,
                });

                if (resultResponse.ok) {
                  const resultData = await resultResponse.json();
                  const resultJson = resultData.result_json || resultData;
                  
                  // 메트릭 추출
                  const xfactor = resultJson?.xfactor?.summary?.xfactor_at_impact_deg ?? 
                                 resultJson?.metrics?.xfactor?.summary?.xfactor_at_impact_deg ?? 
                                 null;
                  
                  const comMetric = resultJson?.metrics?.com_speed || resultJson?.com_speed;
                  const comShift = comMetric?.metrics?.com_shift || comMetric?.com_shift;
                  
                  const backShift = comShift?.summary?.back_shift_pct ?? 
                                   comShift?.summary?.back_shift ?? 
                                   null;
                  
                  const downShift = comShift?.summary?.down_shift_pct ?? 
                                   comShift?.summary?.down_shift ?? 
                                   null;
                  
                  const swingSpeedMetric = resultJson?.metrics?.swing_speed || resultJson?.swing_speed;
                  const swingSpeed = swingSpeedMetric?.series 
                    ? Math.max(...swingSpeedMetric.series.map(Number))
                    : null;
                  
                  const headMetric = resultJson?.metrics?.head || resultJson?.head || resultJson?.metrics?.head_speed || resultJson?.head_speed;
                  const headGrade = headMetric?.summary?.grade || headMetric?.grade || null;
                  
                  const modelResult = resultJson?.stgcn_inference?.prediction ?? 
                                     resultJson?.model_result?.prediction ?? 
                                     null;

                  setLatestMetrics({
                    uploadTime: latestRecord.upload_time,
                    model: modelResult,
                    xfactor,
                    backShift,
                    downShift,
                    swingSpeed,
                    headGrade,
                  });
                }
              } catch (err) {
                console.error("Failed to fetch metrics:", err);
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="flex flex-col justify-center items-center bg-[#f6fcf5] dark:bg-slate-950 py-[50px]">
      <div className="max-w-[1500px] w-full border border-[#e6e6e6] dark:border-slate-700 bg-white dark:bg-slate-900 rounded-[14px] py-[40px] px-[56px]">
        {/* 사용자 정보 섹션 */}
        <div className="flex flex-row items-center gap-[30px] pb-[40px]">
          <div>
            <Image
              src={"/images/account_circle.png"}
              width={100}
              height={100}
              alt="유저"
            />
          </div>
          <div className="">
            <div className="flex flex-row gap-[10px] pb-[10px]">
              <div className="text-[#727D87] dark:text-slate-400 text-[20px] w-[70px]">이름</div>
              <div className="text-black dark:text-white text-[20px] font-medium">{userName}</div>
            </div>
            <div className="flex flex-row gap-[10px] pb-[10px]">
              <div className="text-[#727D87] dark:text-slate-400 text-[20px] w-[70px]">이메일</div>
              <div className="text-black dark:text-white text-[20px] font-medium break-all">
                {userEmail}
              </div>
            </div>
            <div className="flex flex-row gap-[10px]">
              <div className="text-[#727D87] dark:text-slate-400 text-[20px] w-[70px]">User ID</div>
              <div className="text-gray-600 dark:text-slate-300 text-[16px] font-mono break-all">
                {userId}
              </div>
            </div>
          </div>
        </div>

        {/* 최근 스윙 지표 섹션 */}
        {latestMetrics && (
          <div className="mb-[40px]">
            <div className="text-[24px] text-[#1f8552] dark:text-[#4ade80] font-bold mb-[20px]">
              최근 스윙 지표
            </div>
            <div className="rounded bg-gray-50 dark:bg-slate-800 p-4">
              <div className="grid grid-cols-5 gap-4">
                {/* Model Result */}
                <div className="text-center p-3 bg-white dark:bg-slate-700 rounded">
                  <div className="text-xs text-gray-600 dark:text-slate-400 mb-2">Model 결과</div>
                  <div className="text-lg font-bold text-[#1f8552] dark:text-[#4ade80]">
                    {latestMetrics.model ? String(latestMetrics.model).toUpperCase() : "-"}
                  </div>
                </div>

                {/* X-Factor */}
                <div className="text-center p-3 bg-white dark:bg-slate-700 rounded">
                  <div className="text-xs text-gray-600 dark:text-slate-400 mb-2">X-Factor</div>
                  <div className="text-lg font-bold text-black dark:text-white">
                    {latestMetrics.xfactor ? `${Number(latestMetrics.xfactor).toFixed(1)}°` : "-"}
                  </div>
                </div>

                {/* COM */}
                <div className="text-center p-3 bg-white dark:bg-slate-700 rounded">
                  <div className="text-xs text-gray-600 dark:text-slate-400 mb-2">COM</div>
                  <div className="text-sm font-bold text-black dark:text-white">
                    {latestMetrics.backShift !== null && latestMetrics.downShift !== null ? (
                      <>
                        <div>BS:{Number(latestMetrics.backShift).toFixed(0)}%</div>
                        <div>DS:{Number(latestMetrics.downShift).toFixed(0)}%</div>
                      </>
                    ) : (
                      "-"
                    )}
                  </div>
                </div>

                {/* Swing Speed */}
                <div className="text-center p-3 bg-white dark:bg-slate-700 rounded">
                  <div className="text-xs text-gray-600 dark:text-slate-400 mb-2">Swing Speed</div>
                  <div className="text-lg font-bold text-black dark:text-white">
                    {latestMetrics.swingSpeed ? `${Number(latestMetrics.swingSpeed).toFixed(1)} km/h` : "-"}
                  </div>
                </div>

                {/* Head */}
                <div className="text-center p-3 bg-white dark:bg-slate-700 rounded">
                  <div className="text-xs text-gray-600 dark:text-slate-400 mb-2">Head</div>
                  <div className="text-lg font-bold text-black dark:text-white">
                    {latestMetrics.headGrade ? String(latestMetrics.headGrade).toUpperCase() : "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 스윙 기록 테이블 */}
        <SwinghistoryComponent />
      </div>
    </div>
  );
}

export default page;
