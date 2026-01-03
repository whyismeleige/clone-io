"use client";
import React, { useState, useEffect } from "react";
import {
  Alert as AlertType,
  AlertType as AlertTypeEnum,
} from "@/types/alert.types"
import {
  AlertDescription,
  AlertTitle,
  AlertTimer,
  Alert as AlertUI,
} from "@/components/ui/alert";
import {
  BellRing,
  CircleCheckBig,
  Info,
  MessageCircleWarning,
  TriangleAlert,
} from "lucide-react";
import { removeAlert } from "@/store/slices/alert.slice";

interface AlertProps {
  alert: AlertType;
}

const Alert: React.FC<AlertProps> = ({ alert }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [timeLeft, setTimeLeft] = useState(100);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const startTime = alert.startTime ?? Date.now();
    const duration = alert.duration ?? 5000;

    const interval = setInterval(() => { 
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 50);

    return () => clearInterval(interval);
  }, [alert]);

  const handleClose = (): void => {
    setIsLeaving(true);
    setTimeout(() => {
      removeAlert(alert.id);
    }, 300);
  };

  const getIcon = () => {
    switch (alert.type) {
      case "success":
        return <CircleCheckBig />;
      case "error":
        return <MessageCircleWarning />;
      case "warning":
        return <TriangleAlert />;
      case "info":
        return <Info />;
      default:
        return <BellRing />;
    }
  };
  return (
    <AlertUI variant={alert.type === "error" ? "error" : "default"}>
      {getIcon()}
      <AlertTitle>{alert.title}</AlertTitle>
      <AlertDescription>{alert.message}</AlertDescription>
      <AlertTimer variant={alert.type} timeLeft={timeLeft}></AlertTimer>
    </AlertUI>
  );
};

export default Alert;