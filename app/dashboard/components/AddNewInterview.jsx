"use client";
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@clerk/nextjs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { chatSession } from '@/utils/GeminiAIModel';
import { LoaderCircle } from 'lucide-react';
import { MockInterview } from '@/utils/schema';
import moment from 'moment/moment';
import { db } from '@/utils/db';
import { useRouter } from 'next/navigation';


function AddNewInterview() {
  const [openDialog, setOpenDialog] = useState(false);
  const [jobPosition, setJobPosition] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobExperience, setJobExperience] = useState('');
  const [loading, setLoading] = useState(false);
  const [jsonResponse, setJsonResponse] = useState([]);
  const { user } = useUser();
  const router = useRouter();

  const handleSubmit = async (event) => {
    setLoading(true);
    event.preventDefault();
    console.log(jobPosition, jobDescription, jobExperience);
    setOpenDialog(false);

    const InputPrompt = `Job Position: ${jobPosition}, Job Description: ${jobDescription}, Years of Experience: ${jobExperience}, Depends on this information please give me ${process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT} interview questions with answers in json format. Please give questions and answers as fields in JSON.`;

    try {
      // Send the message to the AI model and get the result
      const result = await chatSession.sendMessage(InputPrompt);

      // Clean and sanitize the response
      let MockJsonResp = result.response.text()
        .replace('```json', '')  // Remove extra markdown code block markers
        .replace('```', '')      // Remove closing markdown code block
        .replace(/[\u0000-\u001F\u007F]/g, '') // Remove control characters
        .trim();

      console.log("Raw AI Response:", MockJsonResp);  // Log the raw response

      // Try parsing the sanitized response
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(MockJsonResp);
        console.log("Parsed Response:", parsedResponse);  // Log the parsed response
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        throw new Error("Invalid JSON response format");
      }

      setJsonResponse(parsedResponse);  // Store the parsed JSON

      setLoading(false);

      // Proceed to insert into the database if the JSON is valid
      if (parsedResponse) {
        const resp = await db.insert(MockInterview)
          .values({
            mockId: uuidv4(),
            jsonMockResp: MockJsonResp,  // Store original raw JSON string
            jobPosition: jobPosition,
            jobDescription: jobDescription,
            jobExperience: jobExperience,
            createdBy: user?.primaryEmailAddress?.emailAddress,
            createdAt: moment().format('DD-MM-yyyy')
          })
          .returning({ mockId: MockInterview.mockId });

        console.log("Inserted ID:", resp);
        if (resp) {
          setOpenDialog(false);
          router.push('/dashboard/interview/' + resp[0].mockId);
        }
      } else {
        console.log("Error: Parsed response is invalid");
      }
    } catch (error) {
      console.error("Error processing the JSON response:", error);
      toast.error("There was an error processing the interview questions");
      setLoading(false);
    }
  };

  return (
    <div
  >
      <div
        className='p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all'
        onClick={() => setOpenDialog(true)}
      >
        <h2 className='text-lg text-center'>Add</h2>
      </div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Mention Job Details</DialogTitle>
            <DialogDescription>
              <form onSubmit={handleSubmit}>
                <div>
                  <h2 className='font-bold text-2xl'></h2>
                  <h2>Add Details</h2>
                  <div className='mt-7 my-3'>
                    <label>Job Role</label>
                    <Input
                      placeholder="Frontend Developer"
                      required
                      onChange={(event) => setJobPosition(event.target.value)}
                    />
                  </div>
                  <div className='my-3'>
                    <label>Job Description</label>
                    <Textarea
                      placeholder="Ex. HTML, CSS, React"
                      required
                      onChange={(event) => setJobDescription(event.target.value)}
                    />
                  </div>
                  <div className='my-3'>
                    <label>Years of Experience</label>
                    <Input
                      placeholder="1"
                      type="number"
                      required
                      onChange={(event) => setJobExperience(event.target.value)}
                    />
                  </div>
                </div>
                <div className='flex gap-5 justify-end'>
                  <Button type="button" variant="ghost" onClick={() => setOpenDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <LoaderCircle className='animate-spin' />
                        Generating Questions from AI
                      </>
                    ) : (
                      'Start Interview'
                    )}
                  </Button>
                </div>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;
