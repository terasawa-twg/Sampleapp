// src/components/custom/separator.tsx
"use client"

import * as React from "react"
import { Separator as ShadcnSeparator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// ===========================================
// カスタムSeparator (追加機能付き)
// ===========================================

interface CustomSeparatorProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
  // 🟢 カスタム機能追加
  variant?: "default" | "dashed" | "dotted";
  spacing?: "none" | "sm" | "md" | "lg";
  thickness?: "thin" | "normal" | "thick";
}

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  variant = "default",
  spacing = "md",
  thickness = "normal",
  ...props
}: CustomSeparatorProps) {
  // バリアント（線のスタイル）
  const variantClasses = {
    default: "",
    dashed: "border-dashed",
    dotted: "border-dotted"
  }

  // スペーシング（余白）
  const spacingClasses = {
    none: "",
    sm: orientation === "horizontal" ? "my-2" : "mx-2",
    md: orientation === "horizontal" ? "my-4" : "mx-4",
    lg: orientation === "horizontal" ? "my-6" : "mx-6"
  }

  // 太さ
  const thicknessClasses = {
    thin: orientation === "horizontal" ? "h-px" : "w-px",
    normal: "", // デフォルト
    thick: orientation === "horizontal" ? "h-0.5" : "w-0.5"
  }

  const wrapperClass = spacingClasses[spacing]
  const separatorClass = cn(
    variantClasses[variant],
    thicknessClasses[thickness],
    className
  )

  if (spacing === "none") {
    // スペーシングなしの場合は直接レンダリング
    return (
      <ShadcnSeparator
        orientation={orientation}
        decorative={decorative}
        className={separatorClass}
        {...props}
      />
    )
  }

  // スペーシングありの場合はdivでラップ
  return (
    <div className={wrapperClass}>
      <ShadcnSeparator
        orientation={orientation}
        decorative={decorative}
        className={separatorClass}
        {...props}
      />
    </div>
  )
}

export { Separator }