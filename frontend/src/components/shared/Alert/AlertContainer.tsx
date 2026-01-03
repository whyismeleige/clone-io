"use client";
import { useAppSelector } from "@/hooks/redux";
import Alert from "./Alert";

export const AlertContainer = () => {
  const alerts = useAppSelector((state) => state.alert.alerts);

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {alerts.map((alert) => (
        <Alert key={alert.id} alert={alert} />
      ))}
    </div>
  );
};
