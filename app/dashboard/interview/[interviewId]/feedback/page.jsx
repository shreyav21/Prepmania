"use client"
import { UserAnswer } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { db } from '@/utils/db';
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";  // Assuming you have a Button component
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronsDownUp } from 'lucide-react';

const Feedback = ({ params }) => {
  const [feedbackList, setFeedbackList] = useState([]);

  useEffect(() => {
    GetFeedback();
  }, []);

  const GetFeedback = async () => {
    try {
      const result = await db
        .select()
        .from(UserAnswer)
        .where(eq(UserAnswer.mockIdRef, params.interviewId))
        .orderBy(UserAnswer.id);

      console.log(result);
      setFeedbackList(result);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
  };

  return (
    <div className="p-10">
      <h2 className="text-3xl font-bold text-green-500">
        Finally, you are done with your Interview
      </h2>
      <h2 className="font-bold text-2xl">Now get your feedback</h2>
      <h2 className="text-primary text-lg my-2">Your Feedback</h2>
      <h2 className="text-sm text-gray-500">Your questions with correct answers</h2>

      {/* Check if feedbackList has data and map through it */}
      {feedbackList?.length > 0 ? (
        feedbackList.map((item, index) => (
          <Collapsible key={index}>
            <CollapsibleTrigger className="p-2 bg-secondary rounded-lg my-2 flex justify-between gap-7">
              {item.question} <ChevronsDownUp />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="flex flex-col gap-2">
                <h2 className="text-red-500 p-2 border rounded-lg">
                  Rating: {item.rating}
                </h2>
                <h2 className="p-2 border rounded-lg bg-red-50 text-sm text-red-950">
                  <strong>Your Answer</strong>: {item.userAns}
                </h2>
                <h2 className="p-2 border rounded-lg bg-red-50 text-sm text-green-950">
                  <strong>Correct Answer</strong>: {item.correctAns}
                </h2>
                <h2 className="p-2 border rounded-lg bg-red-50 text-sm text-green-950">
                  <strong>Feedback</strong>: {item.feedback}
                </h2>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))
      ) : (
        <p>No feedback available yet.</p> // Display message if no feedback
      )}

      {/* Link to Home */}
      <Link href="/" passHref>
        <Button className="mt-4">Go Home</Button>
      </Link>
    </div>
  );
}

export default Feedback;
