import React from "react";
import XfactorGraph from "./XfactorGraph";

function MetricsComponent() {
  return (
    <div>
      <div className="text-[30px] font-bold pb-[30px] text-[#1f8552]">
        Swing Metrics Analysis
      </div>
      <div className="flex flex-col gap-[50px]">
        <div className="flex flex-row gap-[40px] border border-[#e6e6e6] bg-white rounded-[14px] max-w-[1500px] py-[40px] px-[56px] ">
          <div className="w-[40%]">
            <div className="text-[26px] font-bold pb-[10px]">Xfactor</div>
            <div className="text-[18px]  pb-[30px]">
              X-Factor는 어깨와 골반의 회전 차이를 나타내는 지표로, 스윙의
              파워와 정확도를 결정하는 핵심 요소입니다.
            </div>
            <div className="text-[24px] font-semibold pb-[10px]">
              Your Swing Feedback
            </div>
            <div className="text-[18px]">
              당신의 X-Factor는 15°로, 낮은 수준입니다. 상체와 하체의 회전
              차이가 작아 파워 전달이 부족할 수 있습니다. 백스윙 시 어깨를 조금
              더 돌려 상체 회전각을 늘려보세요.
            </div>
            <div className=" w-full">
              <XfactorGraph />
            </div>
          </div>
          <div className="border border-[#1f8552] rounded-[14px] w-[60%] overflow-hidden">
            <video controls muted playsInline className="w-full ">
              <source src="/video/xfactor.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
        <div className="flex flex-row gap-[40px] border border-[#e6e6e6] bg-white rounded-[14px] max-w-[1500px] py-[40px] px-[56px] ">
          <div className="w-[40%]">
            <div className="text-[26px] font-bold pb-[10px]">COM</div>
            <div className="text-[18px]  pb-[20px]">
              X-Factor는 어깨와 골반의 회전 차이를 나타내는 지표로, 스윙의
              파워와 정확도를 결정하는 핵심 요소입니다.
            </div>
            <div className="text-[24px] font-semibold pb-[10px]">
              Your Swing Feedback
            </div>
            <div className="text-[18px] ">
              당신의 X-Factor는 15°로, 낮은 수준입니다. 상체와 하체의 회전
              차이가 작아 파워 전달이 부족할 수 있습니다. 백스윙 시 어깨를 조금
              더 돌려 상체 회전각을 늘려보세요.
            </div>
          </div>
          <div className="border border-[#1f8552] rounded-[14px] w-[60%] overflow-hidden">
            <video controls muted playsInline className="w-full h-[500px]">
              <source src="/video/com_speed.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
        <div className="flex flex-row gap-[40px] border border-[#e6e6e6] bg-white rounded-[14px] max-w-[1500px] py-[40px] px-[56px] ">
          <div className="w-[40%]">
            <div className="text-[26px] font-bold pb-[10px]">Swing</div>
            <div className="text-[18px]  pb-[20px]">
              X-Factor는 어깨와 골반의 회전 차이를 나타내는 지표로, 스윙의
              파워와 정확도를 결정하는 핵심 요소입니다.
            </div>
            <div className="text-[24px] font-semibold pb-[10px]">
              Your Swing Feedback
            </div>
            <div className="text-[18px] ">
              0–3% 머리 중심이 거의 고정, 시선 흔들림 없음 “머리 위치가 매우
              안정적으로 유지되고 있어요. 중심축이 잘 고정되어 정확한 임팩트를
              돕고 있습니다.”
            </div>
          </div>
          <div className="border border-[#1f8552] rounded-[14px] w-[60%] overflow-hidden">
            <video controls muted playsInline className="w-full h-[500px]">
              <source src="/video/head_speed.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
        <div className="flex flex-row gap-[40px] border border-[#e6e6e6] bg-white rounded-[14px] max-w-[1500px] py-[40px] px-[56px] ">
          <div className="w-[40%]">
            <div className="text-[26px] font-bold pb-[10px]">Head</div>
            <div className="text-[18px]  pb-[20px]">
              X-Factor는 어깨와 골반의 회전 차이를 나타내는 지표로, 스윙의
              파워와 정확도를 결정하는 핵심 요소입니다.
            </div>
            <div className="text-[24px] font-semibold pb-[10px]">
              Your Swing Feedback
            </div>
            <div className="text-[18px] ">
              당신의 X-Factor는 15°로, 낮은 수준입니다. 상체와 하체의 회전
              차이가 작아 파워 전달이 부족할 수 있습니다. 백스윙 시 어깨를 조금
              더 돌려 상체 회전각을 늘려보세요.
            </div>
          </div>
          <div className="border border-[#1f8552] rounded-[14px] w-[60%] overflow-hidden">
            <video controls muted playsInline className="w-full h-[500px]">
              <source src="/video/swing.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
        <div className="flex flex-row gap-[40px] border border-[#e6e6e6] bg-white rounded-[14px] max-w-[1500px] py-[40px] px-[56px] ">
          <div className="w-[40%]">
            <div className="text-[26px] font-bold pb-[10px]">Shoulder</div>
            <div className="text-[18px]  pb-[20px]">
              X-Factor는 어깨와 골반의 회전 차이를 나타내는 지표로, 스윙의
              파워와 정확도를 결정하는 핵심 요소입니다.
            </div>
            <div className="text-[24px] font-semibold pb-[10px]">
              Your Swing Feedback
            </div>
            <div className="text-[18px] ">
              당신의 X-Factor는 15°로, 낮은 수준입니다. 상체와 하체의 회전
              차이가 작아 파워 전달이 부족할 수 있습니다. 백스윙 시 어깨를 조금
              더 돌려 상체 회전각을 늘려보세요.
            </div>
          </div>
          <div className="border border-[#1f8552] rounded-[14px] w-[60%] overflow-hidden">
            <video controls muted playsInline className="w-full h-[500px]">
              <source src="/video/shoulder_sway.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MetricsComponent;
