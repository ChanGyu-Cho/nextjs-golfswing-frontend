"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
function MainComponent() {
  const router = useRouter();
  return (
    <div className="flex justify-center items-center h-full">
      <div className="flex flex-row gap-[50px]">
        <div className="border border-[#e6e6e6] bg-white rounded-[14px] w-[500px]">
          <div className="bg-[#f6fcf5] p-[26px] rounded-t-[14px] h-[250px] flex flex-col justify-between">
            <div className="flex flex-col">
              <div className="font-bold text-[32px] pb-[30px]">2D 분석</div>
              <div className="text-[16px] pb-[25px]">
                휴대폰으로 동작을 분석해보는 가장 빠르고 쉬운 방법
              </div>
            </div>
            <div
              className="w-full bg-white border border-[#1f8552] text-[#1f8552] text-[16px] rounded-[4px] px-[15px] py-[10px] font-semibold text-center  cursor-pointer"
              onClick={() => router.push("/uploader")}
            >
              시작하기
            </div>
          </div>
          <div className="px-[26px] py-[20px] flex flex-col gap-[10px]">
            <div className="flex flex-row items-center gap-[5px]">
              <div className="text-[#1f8552]">
                <FontAwesomeIcon icon={faCheck} />
              </div>
              빅데이터 분석
            </div>
            <div className="flex flex-row items-center gap-[5px]">
              <div className="text-[#1f8552]">
                <FontAwesomeIcon icon={faCheck} />
              </div>
              head 움직임 분석
            </div>
            <div className="flex flex-row items-center gap-[5px]">
              <div className="text-[#1f8552]">
                <FontAwesomeIcon icon={faCheck} />
              </div>
              club 속도 분석
            </div>
            <div className="flex flex-row items-center gap-[5px]">
              <div className="text-[#1f8552]">
                <FontAwesomeIcon icon={faCheck} />
              </div>
              com 중심 분석
            </div>
          </div>
        </div>
        <div className="border border-[#e6e6e6] bg-white rounded-[14px] w-[500px]">
          <div className="bg-[#f6fcf5] p-[26px] rounded-t-[14px] h-[250px] flex flex-col justify-between">
            <div className="flex flex-col">
              <div className="font-bold text-[32px] pb-[30px]">3D 분석</div>
              <div className="text-[16px] pb-[25px]">
                3D 카메라로 동작을 정확하고 세밀하게 분석해보는 가장 기술적인
                방법
              </div>
            </div>
            <div
              onClick={() => router.push("/result")}
              className="w-full bg-white border border-[#1f8552] text-[#1f8552] text-[16px] rounded-[4px] px-[15px] py-[10px] font-semibold text-center"
            >
              시작하기
            </div>
          </div>
          <div className="px-[26px] py-[20px] flex flex-col gap-[10px]">
            <div className="flex flex-row items-center gap-[5px]">
              <div className="text-[#1f8552]">
                <FontAwesomeIcon icon={faCheck} />
              </div>
              빅데이터 분석
            </div>
            <div className="flex flex-row items-center gap-[5px]">
              <div className="text-[#1f8552]">
                <FontAwesomeIcon icon={faCheck} />
              </div>
              head 움직임 분석
            </div>
            <div className="flex flex-row items-center gap-[5px]">
              <div className="text-[#1f8552]">
                <FontAwesomeIcon icon={faCheck} />
              </div>
              club 속도 분석
            </div>
            <div className="flex flex-row items-center gap-[5px]">
              <div className="text-[#1f8552]">
                <FontAwesomeIcon icon={faCheck} />
              </div>
              com 중심 분석
            </div>
            <div className="flex flex-row items-center gap-[5px]">
              <div className="text-[#1f8552]">
                <FontAwesomeIcon icon={faCheck} />
              </div>
              xfactor 분석
            </div>
          </div>
        </div>
      </div>
      {/* <Image
        src={"/images/golf_bg.png"}
        fill
        alt="bg_img"
        objectFit="cover"
        className="z-[-100] "
      /> */}
      {/* 1187cf */}
      {/* <div className=" w-[80%]">
        <div className="flex flex-row gap-[100px]">
          <div className="bg-[#fafff8]/85 p-[40px]  rounded-[16px] w-1/2 flex flex-col justify-between">
            <div className="">
              <div className="font-bold text-[32px] pb-[20px]">2D analysis</div>
              <div className="text-[22px] pb-[25px]">
                2D 분석은 업로드한 영상을 기반으로, 단일 카메라 시점에서 스윙
                동작을 분석합니다. 빠르고 간편하며, 즉각적인 피드백에
                적합합니다.
              </div>
            </div>
            <div
              onClick={() => router.push("/result")}
              className=" cursor-pointer rounded-[10px] w-full bg-[#53b5f6] flex items-center justify-center py-[10px] text-white text-[20px] font-bold"
            >
              Upload
            </div>
          </div>
          <div className="bg-[#fafff8]/85 p-[40px] rounded-[16px] w-1/2 flex flex-col justify-between">
            <div className="font-bold text-[32px] pb-[20px]">3D analysis</div>
            <div className="text-[22px] pb-[25px]">
              3D 깊이 카메라로 스윙을 실시간 촬영하여 분석합니다. 깊이, 회전,
              균형까지 정밀하게 측정해 당신의 스윙 메커니즘을 더 정확히 이해할
              수 있습니다.
            </div>
            <div className=" cursor-pointer rounded-[10px] w-full  bg-[#53b5f6] flex items-center justify-center py-[10px] text-white text-[20px] font-bold">
              Download
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}

export default MainComponent;
