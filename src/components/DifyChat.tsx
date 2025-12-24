import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import './DifyChat.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
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
          'consolidated_ad_performance_view',
          'consolidated_ad_performance_view_last_6_months',
          'campaign_performance_view',
          'product_performance_view'
        ]);
      } catch (error) {
        console.error('Error fetching views:', error);
        setAvailableViews([
          'consolidated_ad_performance_view',
          'consolidated_ad_performance_view_last_6_months',
          'campaign_performance_view',
          'product_performance_view'
        ]);
      } finally {
        setLoadingViews(false);
      }
    };

    if (showSetup && apiKey) {
      fetchAvailableViews();
    }
  }, [showSetup, apiKey, apiUrl]);

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
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('API Success Response:', data);

      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id);
      }

      const assistantMessage: Message = {
        id: data.message_id || Date.now().toString(),
        role: 'assistant',
        content: data.answer || 'Sorry, I could not process your request.',
        timestamp: Date.now()
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
