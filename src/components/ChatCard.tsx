import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function ChatCard({ providerId }) {
  const navigate = useNavigate();

  const handleStartChat = () => {
    navigate(`/customerDashboard?providerId=${providerId}`);
  };

  return (
    <Card className="border shadow-md rounded-lg p-4 w-full max-w-2xl">
      <CardHeader>
        <h3 className="font-semibold text-lg">Contact Provider</h3>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-4">
          Have a question about this service? Start a chat with the provider now.
        </p>
        <Button onClick={handleStartChat} className="w-full">
          Chat with Provider
        </Button>
      </CardContent>
    </Card>
  );
}