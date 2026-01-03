export type AlertType =
  | "success"
  | "error"
  | "warning"
  | "message"
  | "announcement"
  | "info";

export interface AlertOptions {
  title?: string;
  autoClose?: boolean;
  duration?: number;
  startTime?: number;
}

export interface Alert extends AlertOptions {
  id: number;
  type: AlertType;
  message: string;
}


