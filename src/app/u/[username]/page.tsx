'use client';

import React, { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CardHeader, CardContent, Card } from '@/components/ui/card';
import { useCompletion } from 'ai/react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import * as z from 'zod';
import { APIResponse } from '@/types/ApiResponse';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { messagechema } from '@/schemas/messageSchema';
import { error } from 'console';


const specialChar = '||';

const parseStringMessages = (messageString: string): string[] => {
  return messageString.split(specialChar);
};

const initialMessageString =
  "What's your favorite movie?||Do you have any pets?||What's your dream job?";

export default function SendMessage() {
  const params = useParams<{ username: string }>();
  const username = params.username;

  const {
    complete,
    completion,
    isLoading: isSuggestLoading,
    error,
  } = useCompletion({
    api: '/api/suggest-messages',
    initialCompletion: initialMessageString,
  });
  
  const form = useForm<z.infer<typeof messagechema>>({
    resolver: zodResolver(messagechema),
  });
  const messageContent = form.watch('content');

  const handleMessageClick = (message: string) => {
    form.setValue('content', message);
  };

  //useStates defined
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchLoading, setIsFetchLoading] = useState(false);
  const [fetchSuggestedMessage,setFetchSuggestedMessage]=useState("")

  const onSubmit = async (data: z.infer<typeof messagechema>) => {
    setIsLoading(true);
    try {
      const response = await axios.post<APIResponse>('/api/send-message', {
        ...data,
        username,
      });

      toast({
        title: response.data.message,
        variant: 'default',
      });
      form.reset({ ...form.getValues(), content: '' });
    } catch (error) {
      const axiosError = error as AxiosError<APIResponse>;
      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ?? 'Failed to sent message',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };


//Fetch Suggest message
  const fetchSuggestedMessages = async () => {
    setIsFetchLoading(true)
    try {
  
      // Directly call the backend API to fetch the prompt for testing
      const response = await fetch('/api/suggest-messages', {
        method: 'POST',  // Ensure it's a POST request
      });
  
      // Check if the response is OK and handle the data
      if (response.ok) {
        const data = await response.json();  // Parse JSON response
  
        // Ensure the prompt exists and is a string before calling complete
        if (data && data.success && typeof data.prompt === 'string') {
  
          // Now, calling complete with the correct string prompt
          const prompt = data.prompt;  // This should be a string with messages separated by ||
          setFetchSuggestedMessage(prompt)
  
        } else {
          console.error("Unexpected response format from API:", data);
        }
      } else {
        console.error("Failed to fetch messages. Response status:", response.status);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: 'Error',
        description: 'Failed to fetch suggested messages.',
        variant: 'destructive',
      });
    }finally {
      setIsFetchLoading(false);
    }
  };
  



  return (
    <div className="container mx-auto my-8 p-6 bg-white rounded max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Public Profile Link
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Send Anonymous Message to @{username}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your anonymous message here"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center">
            {isLoading ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading || !messageContent}>
                Send It
              </Button>
            )}
          </div>
        </form>
      </Form>

      <div className="space-y-4 my-8">
        <div className="space-y-2">

        {isFetchLoading ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait...
              </Button>
            ) : (
              <Button type="submit" onClick={fetchSuggestedMessages} >
                Suggest Messages
              </Button>
            )}


          {/* <Button
            onClick={fetchSuggestedMessages}
            className="my-4"
            disabled={isLoading}
          >
            Suggest Messages
          </Button> */}
          <p>Click on any message below to select it.</p>
        </div>
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Messages</h3>
          </CardHeader>

    <CardContent className="flex flex-col space-y-4">
        {error ? (
          <p className="text-red-500">{error.message}</p>
        ) : (
          // Display completion messages initially or fetched ones when they are ready
          <div className="flex flex-col space-y-4">
            {(fetchSuggestedMessage ? fetchSuggestedMessage : completion) ? (
              parseStringMessages(fetchSuggestedMessage || completion).map((message, index) => {
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="mb-2"
                    onClick={() => handleMessageClick(message)} // Handle click if needed
                  >
                    {message}
                  </Button>
                );
              })
            ) : (
              <p>No suggested messages available</p>
            )}
          </div>
        )}
      </CardContent>


        </Card>
      </div>
      <Separator className="my-6" />
      <div className="text-center">
        <div className="mb-4">Get Your Message Board</div>
        <Link href={'/sign-up'}>
          <Button>Create Your Account</Button>
        </Link>
      </div>
    </div>
  );
}