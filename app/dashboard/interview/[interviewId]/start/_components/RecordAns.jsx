"use client";
import { Button } from '@/components/ui/button';
import Webcam from 'react-webcam';
import React, { useState, useEffect } from 'react';
import useSpeechToText from 'react-hook-speech-to-text';
import { Mic } from 'lucide-react';
import { toast } from 'sonner';
import { chatSession } from '@/utils/GeminiAIModel';
import { useUser } from '@clerk/nextjs';
import { db } from '@/utils/db';
import moment from 'moment';
import { UserAnswer } from '@/utils/schema';
import VideoInterview from './VideoInterview';

function RecordAns({ MockInterviewQuestion, activeQuestionIndex, interviewData }) {
  const [userAnswer, setUserAnswer] = useState('');
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const {
    error,
    interimResult,
    isRecording,
    results,
    setResults,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  useEffect(() => {
    if (Array.isArray(results)) {
      results.forEach((result) => {
        setUserAnswer((prevAns) => prevAns + result?.transcript);
      });
    }
  }, [results]);

  useEffect(() => {
    if (!isRecording && userAnswer.length > 10) {
      UpdateUserAnswer();
    }
  }, [userAnswer]);

  // Optional state to toggle between recording and not
  const [isRecordingState, setIsRecordingState] = useState(false);

  // Handle recording toggle
  const handleRecording = async () => {
    if (isRecordingState) {
      stopSpeechToText();
    } else {
      startSpeechToText();
    }
    setIsRecordingState(!isRecordingState);
  };

  // Function to update the user answer and get feedback
  const UpdateUserAnswer = async () => {
    console.log(userAnswer);

    setLoading(true);
    const feedbackPrompt =
      "Questions: " +
      MockInterviewQuestion[activeQuestionIndex]?.question +
      " User Answer: " +
      userAnswer +
      " Based question and user answer for given interview question. Please provide feedback and rating as an area of improvement.Give the answr in small letters so it is valid JSON ";

    try {
      const result = await chatSession.sendMessage(feedbackPrompt);
      const mockJsonResp = result.response.text().replace('```json', '').replace('```', '');
      console.log(mockJsonResp);

      const jsonFeedbackResponse = JSON.parse(mockJsonResp);

      // Assuming you have your db insertion method here
      const resp = await db.insert(UserAnswer).values({
        mockIdRef: interviewData?.mockId,
        question: MockInterviewQuestion[activeQuestionIndex]?.question,
        correctAns: MockInterviewQuestion[activeQuestionIndex]?.answer,
        userAns: userAnswer,
        feedback: jsonFeedbackResponse?.feedback,
        rating: jsonFeedbackResponse?.rating,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        createdAt: moment().format('DD-MM-YYYY'),
      });

      if (resp) {
        toast('User answer saved successfully');
        setUserAnswer('');
      
      }
    } catch (error) {
      console.error('Error while fetching feedback:', error);
      toast('An error occurred while getting feedback');
    }

    setResults([]) // Clear user answer
    setLoading(false); // Reset loading state
  };

  return (
    <div className="flex items-center justify-center flex-col">
      <div className="flex flex-col mt-20 justify-center items-center rounded-lg">
        {/* Webcam Icon, you can replace it with actual webcam functionality */}
        <Webcam/>
      </div>

      <Button disabled={loading} variant="outline" className="my-10" onClick={handleRecording}>
        {isRecordingState ? (
          <h2 className="text-black flex gap-2">
            <Mic /> Stop Recording
          </h2>
        ) : (
          'Record Answer'
        )}
      </Button>

      {/* Show user answers button for debugging */}
      <Button onClick={UpdateUserAnswer}>
        Show Answers
      </Button>
    </div>
  );
}

export default RecordAns;
