/**
 * AIAssistant component for AI-powered inventory management assistance
 */
import React, { useState, useRef, useEffect } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { 
  Bot, 
  Send, 
  User, 
  AlertCircle, 
  MessageCircle,
  Lightbulb,
  TrendingUp,
  Package,
  Search,
  Settings
} from 'lucide-react';
import { LoadingSpinner } from '../ui/loading-spinner';

interface AIAssistantProps {
  onViewChange: (view: string) => void;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onViewChange }) => {
  const { inventory, getItem } = useInventory();
  const [settings, setSettings] = useState({ geminiApiKey: '' });
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI inventory assistant. I can help you analyze your inventory, suggest optimizations, and answer questions about your stock. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickQuestions = [
    'What items are running low?',
    'Show me inventory trends',
    'Which categories need attention?',
    'Suggest reorder points',
    'Analyze stock distribution',
    'What are my most valuable items?'
  ];

  const handleSendMessage = async (message?: string) => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // If no API key, use the simulation. Otherwise, call the real API.
    if (!settings.geminiApiKey) {
      // Simulate AI response
      setTimeout(() => {
        const aiResponse = generateAIResponse(userMessage.content);
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: aiResponse,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000 + Math.random() * 1000);
      return;
    }

    // Make a real API call to Google Gemini
    try {
      const inventoryContext = `
        Here is the current inventory data in JSON format. Use this to answer my questions.
        Items: ${JSON.stringify(inventory, null, 2)}
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${settings.geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: inventoryContext }, { text: `User question: "${userMessage.content}"` }] }]
        })
      });

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates[0].content.parts[0].text;

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I had trouble connecting to the AI service. Please check your API key and network connection.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = (question: string): string => {
    const lowercaseQuestion = question.toLowerCase();

    if (lowercaseQuestion.includes('low') || lowercaseQuestion.includes('stock')) {
      const lowStockItems = inventory.filter(item => 
        item.minStockLevel !== undefined && item.quantity <= item.minStockLevel
      );
      
      if (lowStockItems.length === 0) {
        return 'Great news! All your items are above their minimum stock levels. Your inventory is well-maintained.';
      }
      
      return `I found ${lowStockItems.length} items running low:\n\n${lowStockItems.map(item => 
        `• ${item.name}: ${item.quantity} ${item.unitType || 'units'} (min: ${item.minStockLevel})`
      ).join('\n')}\n\nI recommend restocking these items soon to avoid stockouts.`;
    }

    if (lowercaseQuestion.includes('trend') || lowercaseQuestion.includes('analysis')) {
      const totalItems = inventory.length;
      const totalValue = inventory.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
      
      return `Here's your inventory analysis:\n\n📊 **Overview**\n• Total items: ${totalItems}\n• Estimated value: $${totalValue.toFixed(2)}\n\n📈 **Insights**\n• Average quantity per item: ${Math.round(inventory.reduce((sum, item) => sum + item.quantity, 0) / totalItems)}\n\nConsider categorizing your items for better organization.`;
    }

    if (lowercaseQuestion.includes('categor') || lowercaseQuestion.includes('attention')) {
      const categories = [...new Set(inventory.map(item => item.category))];
      return `📁 **Category Analysis**\n\nYour inventory contains items from ${categories.length} categories:\n${categories.slice(0, 5).map(cat => 
        `• ${cat || 'Uncategorized'}`
      ).join('\n')}\n\nConsider using consistent category names for better organization.`;
    }

    if (lowercaseQuestion.includes('reorder') || lowercaseQuestion.includes('suggest')) {
      const itemsWithoutMin = inventory.filter(item => !item.minStockLevel);
      
      if (itemsWithoutMin.length === 0) {
        return 'All your items have reorder points set! Your inventory management is well-configured.';
      }
      
      return `I suggest setting minimum stock levels for these ${itemsWithoutMin.length} items:\n\n${itemsWithoutMin.slice(0, 5).map(item => 
        `• ${item.name}: Consider setting min level to ${Math.max(1, Math.round(item.quantity * 0.2))}`
      ).join('\n')}\n\nThis will help prevent stockouts and enable automatic reorder alerts.`;
    }

    if (lowercaseQuestion.includes('valuable') || lowercaseQuestion.includes('expensive')) {
      const valuableItems = inventory
        .filter(item => item.price)
        .sort((a, b) => (b.price || 0) * b.quantity - (a.price || 0) * a.quantity)
        .slice(0, 5);

      if (valuableItems.length === 0) {
        return 'No price information available. Consider adding prices to your items to track inventory value.';
      }

      return `💰 **Most Valuable Items:**\n\n${valuableItems.map(item => 
        `• ${item.name}: $${((item.price || 0) * item.quantity).toFixed(2)} (${item.quantity} × $${item.price?.toFixed(2)})`
      ).join('\n')}\n\nThese items represent the highest value in your inventory. Consider extra security measures for these items.`;
    }

    // Default response
    return `I understand you're asking about "${question}". Based on your current inventory:\n\n• You have ${inventory.length} items\n• ${inventory.filter(item => item.quantity > 0).length} items are in stock\n• ${inventory.filter(item => item.quantity === 0).length} items are out of stock\n\nCould you be more specific about what you'd like to know? I can help with stock analysis and reorder suggestions!`;
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
    handleSendMessage(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bot className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Assistant</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Get intelligent insights and recommendations for your inventory
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => onViewChange('settings')} className="mr-2">
            <Settings className="w-4 h-4 mr-2" />
            Configure API
          </Button>
          <Button onClick={() => onViewChange('dashboard')} variant="secondary">
            Back to Dashboard
          </Button>
        </div>
      </div>

      {!settings.geminiApiKey && (
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            To use the AI Assistant, you need to configure your Google Gemini API key in the settings. 
            This is currently running in demo mode with simulated responses.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Chat Assistant</span>
            </CardTitle>
            <CardDescription>
              Ask questions about your inventory and get intelligent insights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages */}
            <div className="h-96 overflow-y-auto space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white dark:bg-gray-700 border'
                  }`}>
                    <div className="flex items-start space-x-2">
                      <div className="flex-shrink-0 mt-1">
                        {message.type === 'user' ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </div>
                        <div className={`text-xs mt-1 ${
                          message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTimestamp(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-700 border rounded-lg p-3 max-w-[80%]">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce animate-delay-100"></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce animate-delay-200"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your inventory..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={() => handleSendMessage()} 
                disabled={isLoading || !inputMessage.trim()}
                aria-label={isLoading ? "Sending message..." : "Send message"}
                aria-disabled={isLoading || !inputMessage.trim()}
                data-tooltip-id="send-message-tooltip"
                data-tooltip-content={
                  isLoading ? "Please wait while sending..." : 
                  !inputMessage.trim() ? "Enter a message to send" : ""
                }
              >
                {isLoading ? (
                  <LoadingSpinner size={16} />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Insights */}
        <div className="space-y-6">
          {/* Quick Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5" />
                <span>Quick Questions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left"
                  onClick={() => handleQuickQuestion(question)}
                  disabled={isLoading}
                >
                  {question}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Inventory Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Quick Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Items</span>
                <Badge className="bg-gray-100 text-gray-800">{inventory.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Categories</span>
                <Badge className="bg-gray-100 text-gray-800">{[...new Set(inventory.map(item => item.category))].length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">In Stock</span>
                <Badge className="bg-green-100 text-green-800">
                  {inventory.filter(item => item.quantity > 0).length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Out of Stock</span>
                <Badge className="bg-red-100 text-red-800">
                  {inventory.filter(item => item.quantity === 0).length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Low Stock</span>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {inventory.filter(item => item.minStockLevel !== undefined && item.quantity <= item.minStockLevel).length}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* AI Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="w-5 h-5" />
                <span>AI Features</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4" />
                <span>Inventory analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4" />
                <span>Smart search</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
