import React from "react";
import SwingInfoComponent from "../Components/Common/SwingInfoComponent";

function ModelComponent() {
  return (
    <div className="flex flex-col ">
      <div className="text-[32px] font-bold pb-[20px] text-[#1f8552]">
        AI Model Swing Evaluation
      </div>
      <div className="flex flex-col gap-[50px] pb-[80px]">
        <div className="flex flex-col border border-[#e6e6e6] bg-white rounded-[14px] max-w-[1300px] py-[40px] px-[56px]">
          <div className="flex flex-row items-center gap-[35px] pb-[30px]">
            <div className="text-[24px] font-bold text-black">Model Result</div>
            <div className="text-[24px] font-medium text-black">GOOD</div>
          </div>
          <div className="text-[22px] text-black">
            6,000개 이상의 스윙 데이터를 기반으로 분석한 결과,
          </div>
          <div className="text-[22px] flex flex-row gap-[10px] items-center text-black">
            <div>당신의 스윙은</div>
            <div className="text-[#1f8552] font-bold text-[26px]">
            프로
            </div>
            <div>수준의 스윙 패턴과 유사한 특징을 보입니다. </div>
          </div>
          <div className=" mt-[50px]">
            <SwingInfoComponent />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModelComponent;
