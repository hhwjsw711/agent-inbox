import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "../ui/button";

export function SignInWithPassword({
  onModeChange,
}: {
  onModeChange?: (mode: "signIn" | "signUp") => void;
}) {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"signUp" | "signIn">("signIn");

  const toggleStep = (newStep: "signUp" | "signIn") => {
    setStep(newStep);
    if (onModeChange) onModeChange(newStep);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="text-center"></div>
      <form
        className="flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          await signIn("password", formData);
        }}
      >
        <input
          name="email"
          type="email"
          placeholder="邮箱"
          required
          className="p-2 border rounded bg-background"
        />
        <input
          name="password"
          type="password"
          placeholder="密码"
          required
          className="p-2 border rounded bg-background"
        />
        <input name="flow" type="hidden" value={step} />
        <div className="flex flex-col gap-2">
          <Button type="submit" className="w-full">
            {step === "signIn" ? "登录" : "注册"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="text-sm"
            onClick={() => toggleStep(step === "signIn" ? "signUp" : "signIn")}
          >
            {step === "signIn"
              ? "没有账号？注册"
              : "已有账号？登录"}
          </Button>
        </div>
      </form>
    </div>
  );
}
