'use client';

import { MessageCard } from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Message } from '@/models/User';
import { APIResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Loader2, RefreshCcw } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AcceptMessagesSchema } from '@/schemas/acceptMessageSchema';

function UserDashboard() {
  // useState hooks
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const [isAcceptMessages, setIsAcceptMessages] = useState<boolean>(false); // Initialize as false

  // useToast hook
  const { toast } = useToast();

  // Function to delete a message
  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  };

  // useSession hook
  const { data: session } = useSession();

  // useForm hook
  const form = useForm({
    resolver: zodResolver(AcceptMessagesSchema),
    defaultValues: {
      acceptMessages: isAcceptMessages,
    },
  });

  // destructuring useForm hook
  const { register, watch, setValue } = form;
  const acceptMessages = watch('acceptMessages');

  // Fetch initial accept messages status from the server
  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<APIResponse>('/api/accept-message');
      
      if (response.data.message === 'noMessages') {
        toast({
          title: 'No Messages found',
          description: 'No messages found in your inbox',
          variant: 'custom',
        });
      } else {
        const acceptMessagesFromBackend = response.data.isAcceptingMessages ?? false;
        setIsAcceptMessages(acceptMessagesFromBackend);
        // Set the form value after we receive the backend response
        setValue('acceptMessages', acceptMessagesFromBackend);
        
      }
    } catch (error) {
      const axiosError = error as AxiosError<APIResponse>;
      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ?? 'Failed to fetch message settings',
        variant: 'destructive',
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue, toast]);

  // Fetch messages from the server
  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      setIsSwitchLoading(false);
      try {
        const response = await axios.get<APIResponse>('/api/get-messages');
        setMessages(response.data.messages || []);
        if (refresh) {
          toast({
            title: 'Refreshed Messages',
            description: 'Showing latest messages',
          });
        }
      } catch (error) {
        const axiosError = error as AxiosError<APIResponse>;
        toast({
          title: 'Error',
          description:
            axiosError.response?.data.message ?? 'Failed to fetch messages',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
        setIsSwitchLoading(false);
      }
    },
    [setIsLoading, setMessages, toast]
  );

  // Fetch initial state when session is available
  useEffect(() => {
    if (!session || !session.user) return;
    fetchMessages();
    fetchAcceptMessages(); 
  }, [session, fetchAcceptMessages, fetchMessages]);

  // Handle switch change (to accept/reject messages)
  const handleSwitchChange = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post<APIResponse>('/api/accept-message', {
        acceptMessages: !acceptMessages,
      });
      
      // Update form state and local state after toggling switch
      setValue('acceptMessages', !acceptMessages); // Update form state
      setIsAcceptMessages(!acceptMessages); // Update local state
      toast({
        title: response.data.message,
        variant: 'default',
      });
    } catch (error) {
      const axiosError = error as AxiosError<APIResponse>;
      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ?? 'Failed to update message settings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If no session or user, return an empty div (this is for handling user authentication)
  if (!session || !session.user) {
    return <div></div>;
  }

  // Get user information
  const { username } = session?.user as User;
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  // Function to copy the profile URL to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: 'URL Copied!',
      description: 'Profile URL has been copied to clipboard.',
    });
  };

  return (
    <div className="md:mx-auto lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      {/* Copy Unique Link Section */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      {/* Accept Messages Switch */}
      <div className="mb-4">
        <Switch
          {...register('acceptMessages')}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">Accept Messages: {acceptMessages ? 'On' : 'Off'}</span>
      </div>
      <Separator />

      {/* Refresh Messages Button */}
      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true); // Refresh messages on button click
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>

      {/* Display Messages */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageCard
              key={String(message._id)}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
