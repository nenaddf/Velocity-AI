import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, MessageSquare, Trash2, Edit2, Check, X, Copy, Download, FileDown, User, Bot } from 'lucide-react';
import ChartRenderer from './ChartRenderer';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import './DifyChat.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  chartData?: any;
}

interface Conversation {
  id: string;
  name: string;
  messages: Message[];
  conversationId: string;
  timestamp: number;
  variables: {
    view: string;
    model: string;
    agent_persona: string;
  };
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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string>('');
  const [editingConversationId, setEditingConversationId] = useState<string>('');
  const [editingName, setEditingName] = useState<string>('');
  const [copiedMessageId, setCopiedMessageId] = useState<string>('');
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

  // Load conversations from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('dify-conversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed);
      } catch (e) {
        console.error('Failed to load conversations:', e);
      }
    }
  }, []);

  // Save current conversation to localStorage
  const saveCurrentConversation = () => {
    if (messages.length === 0) return;

    const conversationName = messages[0]?.content.substring(0, 30) + (messages[0]?.content.length > 30 ? '...' : '');
    const newConversation: Conversation = {
      id: currentConversationId || Date.now().toString(),
      name: conversationName,
      messages,
      conversationId,
      timestamp: Date.now(),
      variables
    };

    setConversations(prev => {
      const existing = prev.findIndex(c => c.id === newConversation.id);
      let updated;
      if (existing >= 0) {
        updated = [...prev];
        updated[existing] = newConversation;
      } else {
        updated = [newConversation, ...prev];
      }
      localStorage.setItem('dify-conversations', JSON.stringify(updated));
      return updated;
    });

    if (!currentConversationId) {
      setCurrentConversationId(newConversation.id);
    }
  };

  // Auto-save conversation when messages change
  useEffect(() => {
    if (messages.length > 0 && !showSetup) {
      saveCurrentConversation();
    }
  }, [messages]);

  const loadConversation = (conversation: Conversation) => {
    setMessages(conversation.messages);
    setConversationId(conversation.conversationId);
    setVariables(conversation.variables);
    setCurrentConversationId(conversation.id);
    setShowSetup(false);
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => {
      const updated = prev.filter(c => c.id !== id);
      localStorage.setItem('dify-conversations', JSON.stringify(updated));
      return updated;
    });
    if (currentConversationId === id) {
      startNewChat();
    }
  };

  const renameConversation = (id: string, newName: string) => {
    setConversations(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, name: newName } : c);
      localStorage.setItem('dify-conversations', JSON.stringify(updated));
      return updated;
    });
    setEditingConversationId('');
  };

  const startNewChat = () => {
    saveCurrentConversation();
    const newConvId = `conv_${Date.now()}`;
    setCurrentConversationId(newConvId);
    setMessages([]);
    setConversationId('');
    setShowSetup(true);
  };

  const handleStartChat = () => {
    if (!variables.view) {
      alert('Please select a BigQuery view');
      return;
    }
    setShowSetup(false);
  };

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => {
        setCopiedMessageId('');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard');
    }
  };

  const exportConversationToPDF = () => {
    const doc = new jsPDF();
    let yPosition = 20;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const lineHeight = 7;

    doc.setFontSize(16);
    doc.text('AI Chat Conversation', margin, yPosition);
    yPosition += 15;

    messages.forEach((message) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(message.role === 'user' ? 'You:' : 'AI:', margin, yPosition);
      yPosition += lineHeight;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(message.content, 170);
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, margin, yPosition);
        yPosition += lineHeight;
      });

      yPosition += 5;
    });

    doc.save(`chat-conversation-${Date.now()}.pdf`);
  };

  const exportChartToExcel = (chartData: any, messageId: string) => {
    try {
      let dataToExport: any[] = [];
      
      // Handle different chart data structures
      if (chartData.chart_type === 'table') {
        // For tables, convert columns and rows to objects
        dataToExport = chartData.rows.map((row: any[]) => {
          const obj: any = {};
          chartData.columns.forEach((col: string, idx: number) => {
            obj[col] = row[idx];
          });
          return obj;
        });
      } else if (chartData.data) {
        dataToExport = chartData.data;
      } else if (chartData.x_axis && chartData.y_axis) {
        // For line/bar/area charts with x_axis and y_axis arrays
        dataToExport = chartData.x_axis.map((x: any, idx: number) => ({
          [chartData.x_label || 'X']: x,
          [chartData.y_label || 'Y']: chartData.y_axis[idx]
        }));
      } else if (chartData.labels && chartData.values) {
        // For pie/doughnut charts
        dataToExport = chartData.labels.map((label: string, idx: number) => ({
          Label: label,
          Value: chartData.values[idx]
        }));
      } else if (chartData.datasets) {
        // For multi-line or stacked bar charts
        dataToExport = chartData.x_axis.map((x: any, idx: number) => {
          const obj: any = { [chartData.x_label || 'X']: x };
          chartData.datasets.forEach((dataset: any) => {
            obj[dataset.label] = dataset.data[idx];
          });
          return obj;
        });
      }

      if (dataToExport.length === 0) {
        alert('No data available to export');
        return;
      }

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, chartData.title || 'Chart Data');
      XLSX.writeFile(wb, `${chartData.title || 'chart-data'}-${messageId}.xlsx`);
    } catch (err) {
      console.error('Failed to export chart:', err);
      alert('Failed to export chart data');
    }
  };

  if (showSetup) {
    return (
      <div className="dify-chat-container">
        {/* Conversation History Sidebar - Always Visible */}
        <div className="dify-history-sidebar">
          <div className="dify-history-header">
            <h3>Chat History</h3>
            <button onClick={startNewChat} className="dify-new-chat-sidebar">
              New Chat
            </button>
          </div>
          <div className="dify-history-list">
            {conversations.length === 0 ? (
              <div className="dify-history-empty">No saved conversations</div>
            ) : (
              conversations.map(conv => (
                <div 
                  key={conv.id} 
                  className={`dify-history-item ${currentConversationId === conv.id ? 'active' : ''}`}
                  onClick={() => loadConversation(conv)}
                >
                  <div className="dify-history-content">
                    <MessageSquare size={16} />
                    <span className="dify-history-name">{conv.name}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="dify-chat-main">
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
      </div>
    );
  }

  return (
    <div className="dify-chat-container">
      {/* Conversation History Sidebar - Always Visible */}
      <div className="dify-history-sidebar">
        <div className="dify-history-header">
          <h3>Chat History</h3>
          <button onClick={startNewChat} className="dify-new-chat-sidebar">
            New Chat
          </button>
        </div>
          <div className="dify-history-list">
            {conversations.length === 0 ? (
              <div className="dify-history-empty">No saved conversations</div>
            ) : (
              conversations.map(conv => (
                <div 
                  key={conv.id} 
                  className={`dify-history-item ${currentConversationId === conv.id ? 'active' : ''}`}
                >
                  {editingConversationId === conv.id ? (
                    <div className="dify-history-edit">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            renameConversation(conv.id, editingName);
                          }
                        }}
                        className="dify-history-input"
                        autoFocus
                      />
                      <button onClick={() => renameConversation(conv.id, editingName)} className="dify-icon-btn">
                        <Check size={16} />
                      </button>
                      <button onClick={() => setEditingConversationId('')} className="dify-icon-btn">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="dify-history-content" onClick={() => loadConversation(conv)}>
                        <MessageSquare size={16} />
                        <span className="dify-history-name">{conv.name}</span>
                      </div>
                      <div className="dify-history-actions">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingConversationId(conv.id);
                            setEditingName(conv.name);
                          }} 
                          className="dify-icon-btn"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conv.id);
                          }} 
                          className="dify-icon-btn"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      <div className="dify-chat-main">
        <div className="dify-chat-header">
          <h2>AI Assistant</h2>
          {messages.length > 0 && (
            <button 
              onClick={exportConversationToPDF}
              className="dify-export-pdf-btn"
              title="Export conversation to PDF"
            >
              <Download size={18} />
              <span>Export PDF</span>
            </button>
          )}
        </div>
      
      <div className="dify-chat-messages">
        {messages.length === 0 && (
          <div className="dify-chat-empty">
            <p>Start a conversation with the AI assistant</p>
          </div>
        )}
        {messages.map((message) => {
          console.log('Rendering message:', message.id, 'Has chartData:', !!message.chartData, 'Chart type:', message.chartData?.chart_type);
          return (
          <div key={message.id} className={`dify-message dify-message-${message.role}`}>
            <div className="dify-message-avatar">
              {message.role === 'user' ? (
                <div className="dify-avatar dify-avatar-user">
                  <User size={20} />
                </div>
              ) : (
                <div className="dify-avatar dify-avatar-assistant">
                  <Bot size={20} />
                </div>
              )}
            </div>
            <div className="dify-message-wrapper">
              {message.role === 'user' && message.content && (
                <button 
                  onClick={() => copyToClipboard(message.content, message.id)}
                  className="dify-copy-btn"
                  title="Copy message"
                >
                  {copiedMessageId === message.id ? (
                    <Check size={16} />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              )}
              {message.content && (
                <div className="dify-message-content">
                  {message.content}
                </div>
              )}
              {message.role === 'assistant' && message.content && (
                <button 
                  onClick={() => copyToClipboard(message.content, message.id)}
                  className="dify-copy-btn"
                  title="Copy message"
                >
                  {copiedMessageId === message.id ? (
                    <Check size={16} />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              )}
            </div>
          </div>
          {message.chartData && message.chartData.chart_type && (
            <div className="dify-message dify-message-assistant dify-chart-message">
              <div className="dify-message-avatar">
                <div className="dify-avatar dify-avatar-assistant">
                  <Bot size={20} />
                </div>
              </div>
              <div className="dify-chart-content-wrapper">
                <div className="dify-chart-wrapper">
                  <ChartRenderer chartData={message.chartData} />
                </div>
                <div className="dify-chart-hover-actions">
                  <button 
                    onClick={() => copyToClipboard(JSON.stringify(message.chartData, null, 2), message.id + '-chart')}
                    className="dify-copy-btn"
                    title="Copy chart data"
                  >
                    {copiedMessageId === message.id + '-chart' ? (
                      <Check size={16} />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                  <button 
                    onClick={() => exportChartToExcel(message.chartData, message.id)}
                    className="dify-copy-btn"
                    title="Export to Excel"
                  >
                    <FileDown size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
          <div style={{display: 'none'}}>
          </div>
          );
        })}
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
    </div>
  );
};

export default DifyChat;
