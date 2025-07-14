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
  Loader2, 
  User, 
  AlertCircle, 
  MessageCircle,
  Lightbulb,
  TrendingUp,
  Package,
  Search,
  Settings
} from 'lucide-react';
import './AIAssistant.css';

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
  const { state } = useInventory();
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

  const handleSendMessage = async (e?: React.MouseEvent | string) => {
    const message = typeof e === 'string' ? e : inputMessage;
    if (!message.trim()) return;

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
    if (!state.settings.geminiApiKey) {
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
        Items: ${JSON.stringify(state.items.map(item => {
          const baseItem = {
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            categoryId: item.categoryId
          };
          return 'price' in item && item.price !== undefined 
            ? { ...baseItem, price: item.price, value: (item.price * item.quantity).toFixed(2) }
            : baseItem;
        }), null, 2)}
        Categories: ${JSON.stringify(state.categories, null, 2)}
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${state.settings.geminiApiKey}`, {
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
      // Consider items with less than 20% of average quantity as low stock
      const avgQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0) / state.items.length;
      const lowStockThreshold = avgQuantity * 0.2;
      
      const lowStockItems = state.items.filter(item => 
        item.quantity <= lowStockThreshold
      );
      
      if (lowStockItems.length === 0) {
        return 'Great news! All your items have sufficient stock levels.';
      }
      
      return `I found ${lowStockItems.length} items running low:\n\n${lowStockItems.map(item => 
        `• ${item.name}: ${item.quantity} ${item.unit}`
      ).join('\n')}\n\nConsider restocking these items soon.`;
    }

    if (lowercaseQuestion.includes('trend') || lowercaseQuestion.includes('analysis')) {
      const totalItems = state.items.length;
      const hasPrices = state.items.some(item => item.price !== undefined && item.price !== null);
      const categories = state.categories.length;
      
      let response = `Here's your inventory analysis:\n\n📊 **Overview**\n• Total items: ${totalItems}\n• Categories: ${categories}`;
      
      if (hasPrices) {
        const totalValue = state.items.reduce((sum, item) => {
          const price = item.price ?? 0;
          return sum + (price * item.quantity);
        }, 0);
        response += `\n• Estimated value: $${totalValue.toFixed(2)}`;
      }
      
      response += `\n\n📈 **Insights**\n• Most items are in the "${state.categories[0]?.name || 'General'}" category\n• Average items per category: ${Math.round(totalItems / categories)}\n\nConsider diversifying your inventory across more categories for better organization.`;
      return response;
    }

    if (lowercaseQuestion.includes('categor') || lowercaseQuestion.includes('attention')) {
      const categoryStats = state.categories.map(cat => ({
        name: cat.name,
        count: state.items.filter(item => item.categoryId === cat.id).length
      }));

      const emptyCats = categoryStats.filter(cat => cat.count === 0);
      const fullCats = categoryStats.filter(cat => cat.count > 0).sort((a, b) => b.count - a.count);

      return `📁 **Category Analysis**\n\n**Active Categories:**\n${fullCats.map(cat => 
        `• ${cat.name}: ${cat.count} items`
      ).join('\n')}\n\n${emptyCats.length > 0 ? 
        `**Empty Categories:**\n${emptyCats.map(cat => `• ${cat.name}`).join('\n')}\n\nConsider removing unused categories or adding items to them.` : 
        'All categories are being used - great organization!'}`;
    }

    if (lowercaseQuestion.includes('reorder') || lowercaseQuestion.includes('suggest')) {
      // Suggest reorder points for items with quantity > 0
      const activeItems = state.items.filter(item => item.quantity > 0);
      
      if (activeItems.length === 0) {
        return 'No active items found to suggest reorder points for.';
      }
      
      return `Here are suggested reorder points for your active items:\n\n${activeItems.slice(0, 5).map(item => 
        `• ${item.name}: Current ${item.quantity} ${item.unit}, suggested reorder at ${Math.max(1, Math.round(item.quantity * 0.2))}`
      ).join('\n')}\n\nThese suggestions are based on maintaining 20% of current stock levels.`;
    }

    if (lowercaseQuestion.includes('valuable') || lowercaseQuestion.includes('expensive')) {
      const itemsWithPrices = state.items.filter(item => item.price !== undefined);
      
      if (itemsWithPrices.length === 0) {
        return 'No price information available. Consider adding prices to your items to track inventory value.';
      }

      const valuableItems = itemsWithPrices
        .sort((a, b) => (b.price ?? 0) * b.quantity - (a.price ?? 0) * a.quantity)
        .slice(0, 5);

      return `💰 **Most Valuable Items:**\n\n${valuableItems.map(item => 
        `• ${item.name}: $${((item.price ?? 0) * item.quantity).toFixed(2)} (${item.quantity} × $${(item.price ?? 0).toFixed(2)})`
      ).join('\n')}\n\nThese items represent the highest value in your inventory. Consider extra security measures for these items.`;
    }

    // Default response
    const hasPrices = state.items.some(item => item.price !== undefined);
    let response = `I understand you're asking about "${question}". Based on your current inventory:\n\n• You have ${state.items.length} items across ${state.categories.length} categories\n• ${state.items.filter(item => item.quantity > 0).length} items are in stock\n• ${state.items.filter(item => item.quantity === 0).length} items are out of stock`;
    
    if (hasPrices) {
      const totalValue = state.items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);
      response += `\n• Estimated total value: $${totalValue.toFixed(2)}`;
    }
    
    response += `\n\nCould you be more specific about what you'd like to know? I can help with stock analysis, reorder suggestions, category optimization, and more!`;
    return response;
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
          <Button variant="outline" onClick={() => onViewChange('settings')}>
            <Settings className="w-4 h-4 mr-2" />
            Configure API
          </Button>
          <Button variant="outline" onClick={() => onViewChange('dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>

      {!state.settings.geminiApiKey && (
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
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce bounce-delay-1"></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce bounce-delay-2"></div>
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
              <Button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
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
                <Badge variant="secondary">{state.items.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Categories</span>
                <Badge variant="secondary">{state.categories.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">In Stock</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {state.items.filter(item => item.quantity > 0).length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Out of Stock</span>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  {state.items.filter(item => item.quantity === 0).length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Low Stock</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {state.items.filter(item => item.quantity <= 5).length}
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
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Inventory Analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Stock Predictions</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Reorder Suggestions</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Trend Analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Natural Language Queries</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
