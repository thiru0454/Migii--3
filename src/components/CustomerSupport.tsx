
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Headphones, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { LoadingSpinner } from "./ui/loading-spinner";

export function CustomerSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message || !email || !name) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    try {
      // In a real app, this would be an API call to submit the support request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Support request submitted successfully');
      setIsOpen(false);
      setMessage('');
      setEmail('');
      setName('');
    } catch (error) {
      toast.error('Failed to submit support request');
      console.error('Support request error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg p-0 flex items-center justify-center"
        variant="default"
      >
        <Headphones size={24} />
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Contact Support
            </DialogTitle>
            <DialogDescription>
              Our team is here to help. Please fill out the form below and we'll get back to you as soon as possible.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium mb-1 block">Name</label>
              <Input 
                id="name" 
                placeholder="Your name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
            
            <div>
              <label htmlFor="email" className="text-sm font-medium mb-1 block">Email</label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Your email address" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            
            <div>
              <label htmlFor="message" className="text-sm font-medium mb-1 block">Message</label>
              <Textarea 
                id="message" 
                placeholder="How can we help you?" 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                required 
                className="min-h-[100px]" 
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Submitting...
                  </>
                ) : 'Submit Request'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
