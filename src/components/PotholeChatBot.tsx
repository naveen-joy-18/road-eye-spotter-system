
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Send, Cpu, Bot, User, Loader2, Map } from 'lucide-react';
import { toast } from 'sonner';
import { ChatMessage, streamPotholeAIResponse } from '@/services/cerebrasAI';

import IndiaHeatmapView from './map/IndiaHeatmapView';

const PotholeChatBot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'assistant', 
      content: 'Hello! I\'m RoadSense AI\'s pothole expert. Ask me anything about potholes, road damage, detection methods, or prevention techniques.' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Initial suggested questions
  const suggestedQuestions = [
    "What causes potholes to form?",
    "How does AI detect potholes in videos?",
    "What are the different types of road damage?",
    "How accurate is pothole detection technology?",
    "How can we prevent pothole formation?"
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isTyping) return;
    
    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Create a temporary message for streaming
    const tempId = Date.now().toString();
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
    
    let fullResponse = '';
    
    try {
      await streamPotholeAIResponse(
        [...messages, userMessage],
        (chunk) => {
          fullResponse += chunk;
          // Update the assistant message with current accumulated response
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { 
              role: 'assistant', 
              content: fullResponse 
            };
            return updated;
          });
        },
        () => {
          setIsTyping(false);
        },
        (error) => {
          toast.error("Failed to get response from AI");
          setIsTyping(false);
        }
      );
    } catch (error) {
      toast.error("Error communicating with AI");
      setIsTyping(false);
    }
  };

  const askQuestion = (question: string) => {
    setInput(question);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  if (showHeatmap) {
    return <IndiaHeatmapView onClose={() => setShowHeatmap(false)} />;
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Bot className="mr-2 h-5 w-5 text-primary" />
            Pothole Expert Chat
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Cpu className="h-3 w-3" />
              <span>Cerebras AI</span>
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 border-primary/30 hover:bg-primary/10"
              onClick={() => setShowHeatmap(true)}
            >
              <Map className="h-4 w-4 text-primary" />
              <span>See Heatmap</span>
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div 
              key={idx}
              className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`flex gap-2 max-w-[85%]`}>
                {msg.role === 'assistant' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/20 text-primary">AI</AvatarFallback>
                    <AvatarImage src="/placeholder.svg" />
                  </Avatar>
                )}
                
                <div className={`rounded-lg p-3 ${
                  msg.role === 'assistant' 
                    ? 'bg-muted text-left' 
                    : 'bg-primary text-primary-foreground text-right'
                }`}>
                  {msg.content}
                </div>
                
                {msg.role === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">U</AvatarFallback>
                    <AvatarImage src="/placeholder.svg" />
                  </Avatar>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
              AI is typing...
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      {messages.length === 1 && (
        <div className="px-4 pb-3">
          <h3 className="text-sm font-medium mb-2">Suggested questions:</h3>
          <div className="flex flex-wrap gap-1">
            {suggestedQuestions.map((question, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => askQuestion(question)}
              >
                {question}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      <CardFooter className="pt-2">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            ref={inputRef}
            placeholder="Ask about pothole detection, causes or fixes..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            className="flex-grow"
          />
          <Button type="submit" size="icon" disabled={isTyping || !input.trim()}>
            {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default PotholeChatBot;
