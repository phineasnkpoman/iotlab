"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./Button";
import type { ComponentProps } from "react";

export function SubmitButton({ children, pendingText = "Envoi…", ...props }: ComponentProps<typeof Button> & { pendingText?: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending} {...props}>{pending ? pendingText : children}</Button>;
}
