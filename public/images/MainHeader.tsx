"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

function MainHeader() {
  const router = useRouter();
  const pathname = usePathname();
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
    <div className="flex flex-row px-[50px] justify-between items-center sticky top-0 bg-white dark:bg-slate-900 border-b border-b-[#f3f4f6] dark:border-b-slate-700">
      <div className="flex flex-row gap-[100px] items-center">
        <div className="text-[28px]" onClick={() => router.push("/")}>
          <Image
            src={process.env.NODE_ENV === "production" ? (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "/images/logo_tran.png" : "/images/logo_2.png") : "/images/logo_2.png"}
            alt="bg_img"
            width={150}
            height={80}
            className="hidden dark:block"
          />
          <Image
            src={"/images/logo_2.png"}
            alt="bg_img"
            width={150}
            height={80}
            className="dark:hidden"
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
      <div
        className="cursor-pointer text-[22px] text-black dark:text-slate-200 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        onClick={() => router.push("/mypage")}
      >
        MY PAGE
      </div>
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
