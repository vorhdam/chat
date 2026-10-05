import * as React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="h-dvh w-dvw overflow-auto ">
      <div className="flex justify-center items-center w-full h-full">
        {children}
      </div>
    </main>
  );
}
