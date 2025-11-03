import { toast } from "@/components/ui/toast";

interface TelegramNotifyParams {
  name: string;
  provider: "netflix" | "prime";
  image?: string;
  message?: string;
}

export const sendTelegramNotification = async (
  params: TelegramNotifyParams
) => {
  try {
    const response = await fetch("/api/notify/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: params.name,
        provider: params.provider,
        image: params.image || "",
        message:
          params.message ||
          `${params.name} - ${params.provider === "netflix" ? "Netflix" : "Prime"} added`,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error("Telegram notification failed:", result.error);
      // Show error toast
      toast({
        title: "Notification Error",
        description: "Failed to send notification. Check your settings.",
        duration: 3000,
      });
      return false;
    }

    // Show success toast that auto-disappears
    toast({
      title: "Added",
      description: `${params.name} - Telegram notification sent`,
      duration: 2000,
    });

    return true;
  } catch (error) {
    console.error("Error sending telegram notification:", error);
    toast({
      title: "Error",
      description: "Failed to send notification",
      duration: 3000,
    });
    return false;
  }
};
