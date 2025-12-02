import React from "react";
import MainHeader from "../Header/MainHeader";
import TokenSync from "../TokenSync";

function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen">
      <TokenSync />
      <MainHeader />
      <div className="h-[calc(100%-70px)]">{children}</div>
    </div>
  );
}

export default MainLayout;
