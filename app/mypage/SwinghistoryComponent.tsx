import React from "react";

function SwinghistoryComponent() {
  return (
    <div className="pt-[50px] flex flex-col">
      <div className="text-[24px] text-[#1f8552] font-bold">Swing History</div>
      <div className="pt-[20px]">
        {/* header */}
        <div className="border-y border-[#8A99AF] flex flex-row">
          <div className="text-[16px] text-[#8A99AF] py-[15px] w-[10%] text-center">
            날짜
          </div>
          <div className="text-[16px] text-[#8A99AF] py-[15px] w-[10%] text-center">
            시간
          </div>
          <div className="text-[16px] text-[#8A99AF] py-[15px] w-[15%] text-center">
            model
          </div>
          <div className="text-[16px] text-[#8A99AF] py-[15px] w-[15%] text-center">
            xfactor
          </div>
          <div className="text-[16px] text-[#8A99AF] py-[15px] w-[15%] text-center">
            com
          </div>
          <div className="text-[16px] text-[#8A99AF] py-[15px] w-[15%] text-center">
            swing
          </div>
          <div className="text-[16px] text-[#8A99AF] py-[15px] w-[15%] text-center">
            head
          </div>
          <div className="text-[16px] text-[#8A99AF] py-[15px] w-[10%] text-center">
            head
          </div>
        </div>
        {/* body */}
        <div className="border-b border-[#8A99AF] flex flex-row">
          <div className="text-[16px] text-[#333] font-medium py-[15px] w-[10%] flex justify-center items-center">
            11/10
          </div>
          <div className="text-[16px] text-[#333] font-medium py-[15px] w-[10%] flex justify-center items-center">
            13:10
          </div>
          <div className="text-[16px] text-[#333] font-medium py-[15px] w-[15%] flex justify-center items-center">
            GOOD
          </div>
          <div className="text-[16px] text-[#333] font-medium py-[15px] w-[15%] flex justify-center items-center">
            37.4°
          </div>
          <div className="text-[16px] text-[#333] font-medium py-[15px] w-[15%] flex justify-center items-center">
            <div className="flex flex-col">
              <div>BS:-21%</div>
              <div>DS:30%</div>
            </div>
          </div>
          <div className="text-[16px] text-[#333] font-medium py-[15px] w-[15%] flex justify-center items-center">
            56.7 km/h
          </div>
          <div className="text-[16px] text-[#333] font-medium py-[15px] w-[15%] flex justify-center items-center">
            GOOD
          </div>
          <div className=" py-[15px] w-[10%] flex justify-center items-center">
            <div className="border border-[#1f8552] rounded-[4px] px-[12px] py-[8px] leading-[16px] text-[16px] text-[#1f8552] font-medium cursor-pointer">
            상세
            </div>
          </div>
        </div>
        <div className="border-b border-[#8A99AF] flex flex-row">
          <div className="text-[18px] text-[#333] font-medium py-[15px] w-[10%] flex justify-center items-center">
            11/10
          </div>
          <div className="text-[18px] text-[#333] font-medium py-[15px] w-[10%] flex justify-center items-center">
            13:12
          </div>
          <div className="text-[18px] text-[#333] font-medium py-[15px] w-[15%] flex justify-center items-center">
            BAD
          </div>
          <div className="text-[18px] text-[#333] font-medium py-[15px] w-[15%] flex justify-center items-center">
            39°
          </div>
          <div className="text-[18px] text-[#333] font-medium py-[15px] w-[15%] flex justify-center items-center">
            <div className="flex flex-col">
              <div>BS:-21%</div>
              <div>DS:30%</div>
            </div>
          </div>
          <div className="text-[18px] text-[#333] font-medium py-[15px] w-[15%] flex justify-center items-center">
            60.3 km/h
          </div>
          <div className="text-[18px] text-[#333] font-medium py-[15px] w-[15%] flex justify-center items-center">
            EXCESSIVE
          </div>
          <div className=" py-[15px] w-[10%] flex justify-center items-center">
            <div className="border border-[#1f8552] rounded-[4px] px-[12px] py-[8px] leading-[16px] text-[16px] text-[#1f8552] font-medium cursor-pointer">
            상세
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SwinghistoryComponent;
