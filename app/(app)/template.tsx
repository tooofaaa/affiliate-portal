import React from "react";

export default function PageTemplate({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-transition-enter h-full w-full">
      {children}
    </div>
  );
}
