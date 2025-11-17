import React from "react";
import MainHeader from "../Header/MainHeader";

function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen">
      <MainHeader />
      <div className="h-[calc(100%-102px)]">{children}</div>
    </div>
  );
}

export default MainLayout;
