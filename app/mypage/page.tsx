"use client";
import React, { useState } from "react";
import HistoryComponent from "../Components/Mypage/HistoryComponent";
import ResultComponent from "../Components/Mypage/ResultComponent";

function page() {
  const [click, setClick] = useState("1");
  return (
    <div className="flex flex-col  justify-center items-center bg-[#f6fcf5]  py-[50px]">
      <div className="max-w-[1200px] w-full border border-[#e6e6e6] bg-white rounded-[14px] py-[40px] px-[56px]">
        <div className=" pb-[30px]">
          <div className="flex flex-row gap-[10px] pb-[10px]">
            <div className="text-[#727D87] text-[20px]">이름</div>
            <div className="text-black text-[20px] font-medium"> 김이름</div>
          </div>
          <div className="flex flex-row gap-[10px] pb-[10px]">
            <div className="text-[#727D87] text-[20px]">이메일</div>
            <div className="text-black text-[20px] font-medium">
              test@test.com
            </div>
          </div>
        </div>
        <div className="flex flex-row gap-[20px] pb-[20px]">
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
        </div>
        {click == "1" ? <HistoryComponent /> : <ResultComponent />}
      </div>
    </div>
  );
}

export default page;
