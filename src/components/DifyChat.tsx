import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './DifyChat.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  chartData?: any;
}

interface DifyChatProps {
  apiUrl?: string;
  apiKey?: string;
}

const DifyChat: React.FC<DifyChatProps> = ({
  apiUrl = '/.netlify/functions',
  apiKey = ''
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [showSetup, setShowSetup] = useState(true);
  const [variables, setVariables] = useState({
    view: '',
    model: 'GPT-4',
    agent_persona: ''
  });
  const [availableViews, setAvailableViews] = useState<string[]>([]);
  const [loadingViews, setLoadingViews] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchAvailableViews = async () => {
      setLoadingViews(true);
      try {
        const response = await fetch(`${apiUrl}/dify-parameters`, {
          method: 'GET',
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Parameters API response:', data);
          if (data.user_input_form) {
            const viewParam = data.user_input_form.find((param: any) => param.variable === 'view');
            if (viewParam && viewParam.options) {
              setAvailableViews(viewParam.options);
              return;
            }
          }
        }
        
        console.warn('Could not fetch views from API, using fallback');
        setAvailableViews([
          'infinity-os-v00-01.dom_bi_playground.consolidated_ads_performance_view',
          'infinity-os-v00-01.amazon_sp.financial_events_summary_view'
        ]);
      } catch (error) {
        console.error('Error fetching views:', error);
        setAvailableViews([
          'infinity-os-v00-01.dom_bi_playground.consolidated_ads_performance_view',
          'infinity-os-v00-01.amazon_sp.financial_events_summary_view'
        ]);
      } finally {
        setLoadingViews(false);
      }
    };

    if (showSetup) {
      fetchAvailableViews();
    }
  }, [showSetup, apiUrl]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      console.log('Sending message with config:', {
        apiUrl,
        apiKey: apiKey.substring(0, 10) + '...',
        inputs: variables,
        query: input
      });

      const response = await fetch(`${apiUrl}/dify-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {
            view: variables.view,
            model: variables.model,
            agent_persona: variables.agent_persona
          },
          query: input,
          conversation_id: conversationId || '',
          user: 'velocity-user'
        })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        console.error('Request was:', {
          inputs: variables,
          query: input,
          conversation_id: conversationId
        });
        throw new Error(JSON.stringify(errorData) || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('API Success Response:', data);

      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id);
      }

      // Try to parse chart data from the response
      let chartData = null;
      let cleanContent = data.answer || 'Sorry, I could not process your request.';
      
      console.log('Full AI response:', cleanContent);
      
      // Look for JSON chart configuration in the response - try multiple patterns
      let chartMatch = cleanContent.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (chartMatch) {
        console.log('Found chart in code block:', chartMatch[1]);
        try {
          chartData = JSON.parse(chartMatch[1]);
          if (chartData.chart_type) {
            cleanContent = cleanContent.replace(chartMatch[0], '').trim();
            console.log('Successfully parsed chart data:', chartData);
          } else {
            chartData = null;
          }
        } catch (e) {
          console.log('Could not parse chart data from code block:', e);
        }
      }
      
      // Try without code block markers
      if (!chartData) {
        chartMatch = cleanContent.match(/\{[\s\S]*?"chart_type"[\s\S]*?\}/);
        if (chartMatch) {
          console.log('Found chart without code block:', chartMatch[0]);
          try {
            chartData = JSON.parse(chartMatch[0]);
            cleanContent = cleanContent.replace(chartMatch[0], '').trim();
            console.log('Successfully parsed chart data:', chartData);
          } catch (e) {
            console.log('Could not parse chart data:', e);
          }
        }
      }
      
      if (!chartData) {
        console.log('No chart data found in response');
      }

      const assistantMessage: Message = {
        id: data.message_id || Date.now().toString(),
        role: 'assistant',
        content: cleanContent,
        timestamp: Date.now(),
        chartData: chartData
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please check your API configuration.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setConversationId('');
    setShowSetup(true);
  };

  const handleStartChat = () => {
    if (variables.view && variables.agent_persona) {
      setShowSetup(false);
    }
  };

  if (showSetup) {
    return (
      <div className="dify-chat-container">
        <div className="dify-chat-header">
          <h2>AI Assistant Setup</h2>
        </div>
        <div className="dify-setup-form">
          <h3>Configure your chat session</h3>
          <div className="dify-form-group">
            <label>BigQuery View</label>
            {loadingViews ? (
              <div className="dify-loading-views">Loading available views...</div>
            ) : (
              <select
                value={variables.view}
                onChange={(e) => setVariables({...variables, view: e.target.value})}
                className="dify-input"
              >
                <option value="">Select a BigQuery View</option>
                {availableViews.map((view) => (
                  <option key={view} value={view}>
                    {view}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="dify-form-group">
            <label>AI Model</label>
            <select
              value={variables.model}
              onChange={(e) => setVariables({...variables, model: e.target.value})}
              className="dify-input"
            >
              <option value="GPT-4">GPT-4</option>
              <option value="GPT-3.5">GPT-3.5</option>
              <option value="Claude">Claude</option>
            </select>
          </div>
          <div className="dify-form-group">
            <label>Agent Persona & Style</label>
            <textarea
              value={variables.agent_persona}
              onChange={(e) => setVariables({...variables, agent_persona: e.target.value})}
              placeholder="Describe the agent's persona and communication style..."
              className="dify-input dify-textarea"
              rows={4}
            />
          </div>
          <button onClick={handleStartChat} className="dify-start-btn">
            Start Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dify-chat-container">
      <div className="dify-chat-header">
        <h2>AI Assistant</h2>
        <button onClick={startNewChat} className="new-chat-btn">
          New Chat
        </button>
      </div>
      
      <div className="dify-chat-messages">
        {messages.length === 0 && (
          <div className="dify-chat-empty">
            <p>Start a conversation with the AI assistant</p>
          </div>
        )}
        {messages.map((message) => (
          <div key={message.id} className={`dify-message dify-message-${message.role}`}>
            <div className="dify-message-content">
              {message.content}
            </div>
            {message.chartData && message.chartData.chart_type === 'line' && (
              <div className="dify-chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={message.chartData.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey={message.chartData.x_axis} 
                      label={{ value: message.chartData.x_label || message.chartData.x_axis, position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      label={{ value: message.chartData.y_label || message.chartData.y_axis?.[0] || 'Value', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip />
                    <Legend />
                    {message.chartData.y_axis?.map((yKey: string, index: number) => (
                      <Line 
                        key={yKey}
                        type="monotone" 
                        dataKey={yKey} 
                        stroke={['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'][index % 4]}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="dify-message dify-message-assistant">
            <div className="dify-message-content">
              <Loader2 className="dify-loading-icon" />
              <span>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="dify-chat-input-container">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="dify-chat-input"
          rows={1}
          disabled={loading}
        />
        <button 
          onClick={sendMessage} 
          className="dify-send-btn"
          disabled={loading || !input.trim()}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default DifyChat;
