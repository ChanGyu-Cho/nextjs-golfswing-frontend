import React from "react";

function SwingInfoComponent() {
  return (
    <div className="border border-[#e6e6e6] bg-white rounded-[14px] w-full px-[20px] py-[20px] flex flex-row">
      <div className="w-1/5 border-r border-[#e6e6e6] pr-[20px] flex flex-col justify-between">
        <div className="font-bold text-[22px] text-gray-500">model 결과</div>
        <div className="text-[24px] pt-[30px] font-bold flex justify-end">
          GOOD
        </div>
      </div>
      <div className="w-1/5 border-r border-[#e6e6e6] px-[20px] flex flex-col justify-between">
        <div className="font-bold text-[22px] text-gray-500">XFACTOR</div>
        <div className="text-[24px] pt-[30px] font-bold flex justify-end">
          37.4°
        </div>
      </div>
      <div className="w-1/5 border-r border-[#e6e6e6] px-[20px] flex flex-col justify-between">
        <div className="font-bold text-[22px] text-gray-500">COM</div>
        <div className="flex flex-col  text-[24px] font-bold  pt-[30px]">
          <div className="flex justify-end">BS:-21%</div>
          <div className="flex justify-end">DS:30%</div>
        </div>
      </div>
      <div className="w-1/5 border-r border-[#e6e6e6] px-[20px] flex flex-col justify-between">
        <div className="font-bold text-[22px] text-gray-500">SWING</div>
        <div className="text-[24px] pt-[30px] font-bold flex justify-end">
          56.7 km/h
        </div>
      </div>
      <div className="w-1/5 pl-[20px] flex flex-col justify-between">
        <div className="font-bold text-[22px] text-gray-500">HEAD</div>
        <div className="text-[24px] pt-[30px] font-bold flex justify-end">
          GOOD
        </div>
      </div>
    </div>
  );
}

export default SwingInfoComponent;
