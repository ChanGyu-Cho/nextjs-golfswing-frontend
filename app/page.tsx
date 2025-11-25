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

  return (
    <div className="h-[calc(100vh-99px)]">
      <div className="flex flex-col items-center pt-[150px]">
        <div className="flex flex-col items-center gap-[30px] h-[350px]">
          <div className="text-[48px] leading-[50px] font-bold">
            당신의 스윙이 궁금할 때
          </div>
          <div className="text-[120px] leading-[100px] font-bold text-[#166852]">
            Form AI
          </div>
          <div className="text-[48px] leading-[50px] text-[#4b5563]">
            {seqeunce}
          </div>
        </div>
        <div
          className="bg-[#1f8552] text-white rounded-[10px] text-[24px] py-[20px] px-[32px] font-bold cursor-pointer"
          onClick={() => {
            const state = Math.random().toString(36).substring(2, 15);
            try { sessionStorage.setItem('oauth_state', state); } catch (e) {}

            const COGNITO_DOMAIN = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
            const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;
            const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI;
            const SCOPE = process.env.NEXT_PUBLIC_SCOPE;
            const RESPONSE_TYPE = process.env.NEXT_PUBLIC_RESPONSE_TYPE;

            if (!COGNITO_DOMAIN || !CLIENT_ID || !REDIRECT_URI) {
              router.push('/login');
              return;
            }

            const authUrl =
              `${COGNITO_DOMAIN}/oauth2/authorize?` +
              `response_type=${RESPONSE_TYPE}&` +
              `client_id=${CLIENT_ID}&` +
              `redirect_uri=${encodeURIComponent(REDIRECT_URI ?? "")}&` +
              `scope=${encodeURIComponent(SCOPE ?? "")}&` +
              `state=${state}`;

            router.push(authUrl);
          }}
        >
          지금 시작하기
        </div>
      </div>
    </div>
  );
}
