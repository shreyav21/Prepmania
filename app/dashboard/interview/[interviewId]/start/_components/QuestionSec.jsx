"use client";
import { Volume2 } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function QuestionSec({ MockInterviewQuestion, activeQuestionIndex, setActiveQuestionIndex, interviewData }) {

    const textToSpeach = (text) => {
        if ('speechSynthesis' in window) {
            const speech = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(speech);
        } else {
            alert('Your browser does not support text to speech');
        }
    }

    return MockInterviewQuestion && (
        <div className="p-4 py-2 rounded-lg my-5">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {MockInterviewQuestion.map((question, index) => (
                    <h2
                        className={`p-2 bg-secondary rounded-lg text-xs md:text-sm text-center ${activeQuestionIndex === index ? 'bg-black text-white' : ''}`}
                        key={index}
                    >
                        Question {index + 1}
                    </h2>
                ))}
            </div>

            <h2 className="my-5 text-md md:text-lg">{MockInterviewQuestion[activeQuestionIndex]?.question}</h2>

            <Volume2 className="cursor-pointer" onClick={() => textToSpeach(MockInterviewQuestion[activeQuestionIndex]?.question)} />

            {/* Button Section Below */}
            <div className="flex justify-start gap-6 mt-4 mb-60">
                {/* Show Previous Question Button if not on the first question */}
                {activeQuestionIndex > 0 && (
                    <Button onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}>
                        Previous Question
                    </Button>
                )}

                {/* Show Next Question Button if not on the last question */}
                {activeQuestionIndex < MockInterviewQuestion.length - 1 && (
                    <Button onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}>
                        Next Question
                    </Button>
                )}

                {/* Show End Interview Button if on the last question */}
                {activeQuestionIndex === MockInterviewQuestion.length - 1 && (
                    <Link href={`/dashboard/interview/${interviewData?.mockId}/feedback`}>
                        <Button>
                            End Interview
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
}

export default QuestionSec;
