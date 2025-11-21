"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const list = [
    "비용 걱정 마세요.",
    "장소 걱정 마세요.",
    "소음 걱정 마세요.",
    "언제 어디서든",
    "당신의 스윙을 분석하세요.",
  ];

  const [seqeunce, setSequence] = useState<string>("");
  const [textIndex, setTextIndex] = useState(0); // 현재 문장 인덱스
  const [textCount, setTextCount] = useState(0); // 현재 글자 인덱스
  const [isTypingPaused, setIsTypingPaused] = useState<boolean>(false);

  useEffect(() => {
    const currentText = list[textIndex];

    const typingInterval = setInterval(() => {
      if (isTypingPaused) {
        clearInterval(typingInterval);
        // 2초 쉬고 다음 문장으로 이동
        setTimeout(() => {
          setIsTypingPaused(false);
          setTextCount(0);
          setSequence("");
          setTextIndex((prev) => (prev + 1) % list.length); // 다음 문장 (무한 반복)
        }, 1000);
        return;
      }

      if (textCount >= currentText.length) {
        // 문장 완료 → 일시정지
        setIsTypingPaused(true);
        return;
      }

      const nextChar = currentText[textCount];
      setSequence((prev) => prev + nextChar);
      setTextCount((prev) => prev + 1);
    }, 100); // 글자 출력 속도

    return () => clearInterval(typingInterval);
  }, [textIndex, textCount, isTypingPaused, list]);

  {
    /* 1f8552 - 초록색*/
  }
  {
    /* 247a4f */
  }

  return (
    <div className="h-[calc(100vh-99px)]">
      <div className="flex flex-col items-center pt-[150px]">
        <div className="flex flex-col items-center gap-[30px] h-[350px]">
          <div className="text-[48px] leading-[50px] font-bold">
            당신의 스윙이 궁금할 때
          </div>
          {/* 5a4bff - 보라색 */}
          {/* 1f8552 - 초록색*/}
          <div className="text-[120px] leading-[100px] font-bold text-[#166852]">
            Form AI
          </div>
          <div className="text-[48px] leading-[50px] text-[#4b5563]">
            {seqeunce}
          </div>
        </div>
        {/* 247a4f */}
        <div
          className="bg-[#1f8552] text-white rounded-[10px] text-[24px] py-[20px] px-[32px] font-bold cursor-pointer"
          onClick={() => router.push("/login")}
        >
          지금 시작하기
        </div>
      </div>
    </div>
  );
}
