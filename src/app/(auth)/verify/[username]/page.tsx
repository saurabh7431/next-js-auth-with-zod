"use client"
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { verifySchema } from '@/schemas/verifySchema';
import { APIResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const VerifyAccount = () => {
  const [isLoading, setIsLoading] = useState(false);
    const router =useRouter();
    const params=useParams<{username:string}>()
    const {toast}=useToast()

    const form = useForm<z.infer<typeof verifySchema>>({
        resolver: zodResolver(verifySchema),
        defaultValues: {
          code: '', // initialize 'code' field with an empty string
        },
      });

        const onSubmit = async (data: z.infer<typeof verifySchema>)=>{
            try {
              setIsLoading(true);
                const response= await axios.post(`/api/verify-code`, {
                    username:params.username,
                    code:data.code
                })

                toast({
                    title:"Success",
                    description: response.data.message
                })

                router.replace('/sign-in')
            } catch (error) {
                console.error('Error during sign-up:', error);
                 const axiosError = error as AxiosError<APIResponse>;
                      toast({
                        title: 'Sign Up Failed',
                        description: axiosError.response?.data.message,
                        variant: 'destructive',
                      });
            }finally{
              setIsLoading(false);
            }
        }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
          Verify Your Account
        </h1>
        <p className="mb-4">Enter the verification code sent to your email</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            name="code"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verification Code</FormLabel>
                <Input {...field} placeholder='Enter OTP'/>
                <FormMessage />
              </FormItem>
            )}
          />
          {isLoading ?(
            <Button disabled>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Verifying...
            </Button>
          ):(

          <Button type="submit">Verify</Button>
          )}
        </form>
      </Form>
    </div>
  </div>
  )
}

export default VerifyAccount
