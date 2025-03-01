"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import FlowAuthButton from "@/components/Auth/FlowAuthButton";
import ZkSyncAuthButton from "@/components/Auth/ZkSyncAuthButton";

interface AuthButtonsProps {
  onSignInClick?: () => void;
  onSignUpClick?: () => void;
}

const AuthButtons = ({ onSignInClick, onSignUpClick }: AuthButtonsProps) => {
  return (
    <div className="flex items-center gap-4">
      <ZkSyncAuthButton />
      <FlowAuthButton />
    </div>
  );
};

export default AuthButtons; 