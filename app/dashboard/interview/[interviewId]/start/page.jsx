"use client";
import { db } from '@/utils/db';
import Link from 'next/link';
import { MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react';
import QuestionSec from './_components/QuestionSec';
import RecordAns from './_components/RecordAns';
import { Button } from '@/components/ui/button';

function StartInterview({ params }) {
    const [interviewData, setInterviewData] = useState();
    const [MockInterviewQuestion, setMockInterviewQuestion] = useState();
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [loading, setLoading] = useState(true); // Add loading state

    useEffect(() => {
        getInterviewDetails();
    }, []);

    const getInterviewDetails = async () => {
        try {
            const result = await db.select().from(MockInterview)
                .where(eq(MockInterview.mockId, params.interviewId));
            
            if (result.length > 0) {
                const jsonMockResp = JSON.parse(result[0].jsonMockResp);
                console.log(jsonMockResp);
                setMockInterviewQuestion(jsonMockResp);
                setInterviewData(result[0]);
                setLoading(false); // Set loading to false once data is fetched
            } else {
                console.error('Interview data not found');
            }
        } catch (error) {
            console.error('Error fetching interview details:', error);
            setLoading(false);
        }
    };

    // Ensure that the buttons are only displayed when the MockInterviewQuestion is loaded
    if (loading || !MockInterviewQuestion) {
        return <div>Loading interview data...</div>;
    }

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <QuestionSec
                    MockInterviewQuestion={MockInterviewQuestion}
                    activeQuestionIndex={activeQuestionIndex}
                    setActiveQuestionIndex={setActiveQuestionIndex} // Pass down the setter
                    interviewData={interviewData} // Pass interview data
                />

                <RecordAns
                    MockInterviewQuestion={MockInterviewQuestion}
                    activeQuestionIndex={activeQuestionIndex}
                    interviewData={interviewData}
                />
            </div>
        </div>
    );
}

export default StartInterview;
