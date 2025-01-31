"use client"; // Component should run on the client side
import { MockInterview } from '@/utils/schema';
import React, { useEffect, useState } from 'react';
import { db } from '@/utils/db';
import { eq } from 'drizzle-orm'; // Used for building equality conditions in queries
import Webcam from 'react-webcam';
import { Lightbulb, WebcamIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link'; // Correct import for Next.js Link component

function Interview({ params }) {
    const [interviewData, setInterviewData] = useState(null);
    const [webCamEnabled, setWebCamEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getInterviewDetails = async () => {
            try {
                const result = await db
                    .select()
                    .from(MockInterview)
                    .where(eq(MockInterview.mockId, params.interviewId));

                if (result.length > 0) {
                    setInterviewData(result[0]);
                } else {
                    setError("Interview data not found.");
                }
            } catch (err) {
                console.error(err);
                setError("Failed to fetch interview data.");
            } finally {
                setLoading(false);
            }
        };

        getInterviewDetails();
    }, [params.interviewId]); // Add interviewId to the dependency array

    if (loading) return <div>Loading interview details...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!interviewData) return <div>No interview data available.</div>;

    return (
        <div className="my-10">
            <h2 className="font-bold text-2xl">Let's Get Started</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="flex flex-col my-5 gap-5 ">
                    <div className="flex flex-col p-5 rounded-lg border gap-5">
                        <h2 className="text-lg">Job Role: {interviewData.jobPosition}</h2>
                        <h2 className="text-lg">Job Description: {interviewData.jobDescription}</h2>
                        <h2 className="text-lg">Experience: {interviewData.jobExperience} year</h2>
                    </div>
                    <div className="p-5 border rounded-lg border-red-300 bg-red-400">
                        <h2 className="flex gap-2 items-center text-black">
                            <Lightbulb />
                            <strong>Information</strong>
                        </h2>
                        <h2 className="mt-3 text-black">{process.env.NEXT_PUBLIC_INFORMATION}</h2>
                    </div>
                </div>
                <div>
                    {webCamEnabled ? (
                        <Webcam
                            audio={true}
                            videoConstraints={{
                                facingMode: "user", // Front camera on mobile or laptop
                            }}
                            mirrored={true}
                            style={{
                                height: 300,
                                width: 300,
                            }}
                        />
                    ) : (
                        <>
                            <WebcamIcon className="h-72 w-full my-7 p-20 bg-secondary rounded-lg border" />
                            <Button onClick={() => setWebCamEnabled(true)}>
                                Start Camera and Microphone
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="flex justify-end items-end">
                <Link href={`/dashboard/interview/${params.interviewId}/start`}>
                    <Button>Start</Button>
                </Link>
            </div>
        </div>
    );
}

export default Interview;
