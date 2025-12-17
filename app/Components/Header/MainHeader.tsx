"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

function MainHeader() {
  const router = useRouter();
  const pathname = usePathname();
  
  const handleLogout = () => {
    console.log("[MainHeader] Logout initiated");
    
    // Cognito 로그아웃 URL로 바로 리다이렉트
    // Cognito가 로그아웃 처리 후 LOGOUT_URI로 리다이렉트하면서 쿠키도 함께 정리됨
    const COGNITO_DOMAIN = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
    const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;
    const LOGOUT_URI = process.env.NEXT_PUBLIC_LOGOUT_URI || window.location.origin;
    
    if (COGNITO_DOMAIN && CLIENT_ID) {
      // localStorage만 먼저 정리
      localStorage.removeItem("id_token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      
      const logoutUrl = `${COGNITO_DOMAIN}/logout?client_id=${CLIENT_ID}&logout_uri=${encodeURIComponent(LOGOUT_URI)}`;
      console.log("[MainHeader] Redirecting to Cognito logout:", logoutUrl);
      window.location.href = logoutUrl;
    } else {
      // 환경 변수가 없으면 로컬에서만 정리
      localStorage.removeItem("id_token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      
      // 쿠키 삭제 (현재 도메인만)
      document.cookie = "id_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      router.push("/");
    }
  };
  
  const pageList = [
    {
      name: "HOME",
      url: "/",
    },
    {
      name: "MAIN",
      url: "/main",
    },
    {
      name: "RESULT",
      url: "/result",
    },
  ];
  return (
    <div className="flex flex-row px-[50px] py-2 justify-between items-center sticky top-0 bg-white dark:bg-slate-900 border-b border-b-[#f3f4f6] dark:border-b-slate-700">
      <div className="flex flex-row gap-[100px] items-center">
        <div className="text-[28px]" onClick={() => router.push("/")}>
          <Image
            src={"/images/logo_2.png"}
            alt="logo"
            width={120}
            height={60}
            className="block dark:hidden"
          />
          <Image
            src={"/images/logo_tran.png"}
            alt="logo"
            width={120}
            height={60}
            className="hidden dark:block"
          />
        </div>
        {/* {pageList.map((item) => {
          return (
            <div
              className={`cursor-pointer text-[28px]  ${
                item.url == pathname ? "text-black" : "text-[#b7b7b7]"
              }`}
              onClick={() => router.push(item.url)}
            >
              {item.name}
            </div>
          );
        })} */}
      </div>
      {/* <div className="flex flex-row gap-[10px]">
        <div>
          <Link href={"/#main"}>main</Link>
        </div>
        <div>
          <Link href={"/#download"}>download</Link>
        </div>
        <div>
          <Link href={"/#result"}>result</Link>
        </div>
      </div> */}
      {pathname !== "/" && (
        <>
          {pathname === "/mypage" ? (
            <button
              onClick={handleLogout}
              className="px-[24px] py-[10px] bg-red-500 hover:bg-red-600 text-white font-semibold rounded-[8px] transition-colors duration-200 shadow-md hover:shadow-lg text-[18px]"
            >
              로그아웃
            </button>
          ) : (
            <div
              className="cursor-pointer text-[22px] text-black dark:text-slate-200 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              onClick={() => router.push("/mypage")}
            >
              MY PAGE
            </div>
          )}
        </>
      )}
      {/* <Image
        alt={"nav"}
        src={"/images/account_circle.png"}
        width={30}
        height={30}
        className={"cursor-pointer"}
      /> */}
    </div>
  );
}

export default MainHeader;
