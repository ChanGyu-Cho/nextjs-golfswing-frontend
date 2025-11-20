"use client";
import React, { useState } from "react";
import HistoryComponent from "../Components/Mypage/HistoryComponent";
import ResultComponent from "../Components/Mypage/ResultComponent";
import SwingInfoComponent from "../Components/Common/SwingInfoComponent";
import Image from "next/image";
import SwinghistoryComponent from "./SwinghistoryComponent";

function page() {
  const [click, setClick] = useState("1");
  return (
    <div className="flex flex-col  justify-center items-center bg-[#f6fcf5]  py-[50px]">
      <div className="max-w-[1500px] w-full border border-[#e6e6e6] bg-white rounded-[14px] py-[40px] px-[56px]">
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
              <div className="text-[#727D87] text-[20px] w-[70px]">이름</div>
              <div className="text-black text-[20px] font-medium">이현준</div>
            </div>
            <div className="flex flex-row gap-[10px]">
              <div className="text-[#727D87] text-[20px] w-[70px]">이메일</div>
              <div className="text-black text-[20px] font-medium">
                wnswns0528@naver.com
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-between items-center pb-[20px]">
          <div className="text-[24px] text-[#1f8552] font-bold">
            최근 스윙 지표
          </div>
          <div className="flex flex-row items-center cursor-pointer">
            <div className="text-[18px] text-gray-500">자세히 보기</div>
            <Image
              src={"/images/icon_btn_right.png"}
              width={40}
              height={40}
              alt="right"
            />
          </div>
        </div>
        <SwingInfoComponent />
        {/* <div className="flex flex-row gap-[20px] pb-[20px]">
          <div
            onClick={() => setClick("1")}
            className="text-[24px] cursor-pointer border-b "
            style={{
              color: click == "1" ? "#1f8552" : "#000",
              borderColor: click == "1" ? "#1f8552" : "#000",
              borderBottomWidth: click == "1" ? "3px" : "0px",
            }}
          >
            History
          </div>
          <div
            className="text-[24px] cursor-pointer border-b "
            style={{
              color: click == "2" ? "#1f8552" : "#000",
              borderColor: click == "2" ? "#1f8552" : "#000",
              borderBottomWidth: click == "2" ? "3px" : "0px",
            }}
            onClick={() => setClick("2")}
          >
            result
          </div>
        </div> */}
        {/* {click == "1" ? <HistoryComponent /> : <ResultComponent />} */}
        <SwinghistoryComponent />
      </div>
    </div>
  );
}

export default page;
