import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell } from "lucide-react";

export function NotificationAlert({ message, timestamp }: { message: string, timestamp: any }) {
  return (
    <Alert className="mb-3">
      <Bell className="h-4 w-4 text-blue-500" />
      <AlertTitle className="text-sm font-semibold">Recent Activity</AlertTitle>
      <AlertDescription className="text-[15px] text-gray-700">
        {message}
        <br />
        <span className="text-[10px] text-muted-foreground">
         {new Date(timestamp?.seconds * 1000).toLocaleString('en-US', {
                weekday: 'long', // e.g., "Monday"
                hour: '2-digit',
                minute: '2-digit',
                hour12: true // use false for 24-hour format
                })}
        </span>
      </AlertDescription>
    </Alert>
  );
}