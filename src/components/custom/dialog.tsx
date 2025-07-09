// src/components/custom/dialog.tsx
"use client"

import * as React from "react"
import {
  Dialog as ShadcnDialog,
  DialogPortal as ShadcnDialogPortal,
  DialogOverlay as ShadcnDialogOverlay,
  DialogClose as ShadcnDialogClose,
  DialogTrigger as ShadcnDialogTrigger,
  DialogHeader as ShadcnDialogHeader,
  DialogFooter as ShadcnDialogFooter,
  DialogTitle as ShadcnDialogTitle,
  DialogDescription as ShadcnDialogDescription,
} from "@/components/ui/dialog"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// ===========================================
// カスタムDialogContent (showCloseButton機能追加)
// ===========================================

interface CustomDialogContentProps extends React.ComponentProps<typeof DialogPrimitive.Content> {
  showCloseButton?: boolean;
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: CustomDialogContentProps) {
  return (
    <ShadcnDialogPortal data-slot="dialog-portal">
      <ShadcnDialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        {...props}
      >
        {children}
        {/* 🟢 カスタム機能: showCloseButtonで表示制御 */}
        {showCloseButton && (
          <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </ShadcnDialogPortal>
  )
}

// ===========================================
// 他のコンポーネントは元ファイルから再エクスポート
// ===========================================

const Dialog = ShadcnDialog
const DialogTrigger = ShadcnDialogTrigger
const DialogPortal = ShadcnDialogPortal
const DialogClose = ShadcnDialogClose
const DialogOverlay = ShadcnDialogOverlay
const DialogHeader = ShadcnDialogHeader
const DialogFooter = ShadcnDialogFooter
const DialogTitle = ShadcnDialogTitle
const DialogDescription = ShadcnDialogDescription

export {
  Dialog,
  DialogClose,
  DialogContent,  // ← これだけカスタム版
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}