import * as React from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { SignInWithGithub } from "./SignInWithGithub";

export const SignInForm: React.FC = () => (
  <Card className="w-96 mx-auto">
    <CardHeader>
      <h2 className="text-lg text-center">
        欢迎！请登录以继续
      </h2>
    </CardHeader>
    <CardContent className="flex justify-center">
      <SignInWithGithub />
    </CardContent>
  </Card>
);
