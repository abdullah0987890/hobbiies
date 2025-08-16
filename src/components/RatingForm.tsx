import { useState, useEffect } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db, auth } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "sonner";

interface RatingFormProps {
  providerId: string;
}

interface Feedback {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
}

export const RatingForm = ({ providerId }: RatingFormProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [hasRated, setHasRated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [avgRating, setAvgRating] = useState<number>(0);

  // Get logged-in user, role & feedbacks
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCustomerId(user.uid);
        await fetchUserRole(user.uid);
        await checkIfRated(user.uid);
      }
      await fetchFeedbacks();
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchUserRole = async (uid: string) => {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      setRole(userSnap.data().role || null);
    }
  };

  const checkIfRated = async (uid: string) => {
    const ratingsRef = collection(db, "ratings");
    const q = query(ratingsRef, where("providerId", "==", providerId), where("customerId", "==", uid));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      setHasRated(true);
    }
  };

  const fetchFeedbacks = async () => {
    const ratingsRef = collection(db, "ratings");
    const q = query(ratingsRef, where("providerId", "==", providerId));
    const snapshot = await getDocs(q);

    let total = 0;
    const feedbackList: Feedback[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      total += data.rating || 0;

      // Fetch customer name from users collection
      let customerName = "Anonymous";
      if (data.customerId) {
        const userRef = doc(db, "users", data.customerId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          customerName = userSnap.data().name || "Anonymous";
        }
      }

      feedbackList.push({
        id: docSnap.id,
        customerName,
        rating: data.rating,
        comment: data.comment || "",
      });
    }

    setFeedbacks(feedbackList);
    if (feedbackList.length > 0) {
      setAvgRating(total / feedbackList.length);
    }
  };

  const handleSubmit = async () => {
    if (!customerId) {
      setDialogMessage("You must be logged in to rate.");
      setShowDialog(true);
      return;
    }

    if (role === "provider") {
      toast.error("Providers cannot rate other providers.");
      return;
    }

    if (hasRated) {
      setDialogMessage("You have already rated this provider.");
      setShowDialog(true);
      return;
    }

    try {
      await addDoc(collection(db, "ratings"), {
        providerId,
        customerId,
        rating,
        comment,
        timestamp: serverTimestamp(),
      });

      setHasRated(true);
      setDialogMessage("Thank you! Your rating has been submitted.");
      setShowDialog(true);
      setRating(0);
      setComment("");
      await fetchFeedbacks();
    } catch (err) {
      console.error(err);
      setDialogMessage("Something went wrong. Please try again.");
      setShowDialog(true);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      {/* 📌 Feedback Card */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback</CardTitle>
          <p className="text-yellow-500 text-lg">
            {"★".repeat(Math.round(avgRating)) + "☆".repeat(5 - Math.round(avgRating))} ({avgRating.toFixed(1)})
          </p>
        </CardHeader>
        <CardContent>
          {feedbacks.length > 0 ? (
            <div className="space-y-3">
              {feedbacks.map((fb) => (
                <div key={fb.id} className="border-b pb-2">
                  <p className="font-semibold">{fb.customerName}</p>
                  <p className="text-yellow-500 text-sm">
                    {"★".repeat(fb.rating) + "☆".repeat(5 - fb.rating)}
                  </p>
                  <p className="text-gray-600">{fb.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No feedback yet.</p>
          )}
        </CardContent>
      </Card>

      {/* 📌 Rating Form */}
      {role === "provider" ? (
        <p className="text-red-500 font-medium">🚫 Providers cannot leave ratings.</p>
      ) : hasRated ? (
        <p className="text-green-600 font-medium">✅ You have already rated this provider.</p>
      ) : (
        <>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <button
                key={i}
                onClick={() => setRating(i + 1)}
                className={`text-xl ${i < rating ? "text-yellow-500" : "text-gray-300"}`}
              >
                ★
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Leave a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button onClick={handleSubmit} className="w-full">
            Submit Rating
          </Button>
        </>
      )}

      {/* 📌 Dialog for alerts */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Notice</AlertDialogTitle>
            <AlertDialogDescription>{dialogMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={() => setShowDialog(false)}>OK</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
