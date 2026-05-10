import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

const MentorChatbot = () => {
  const mentorId = localStorage.getItem('userId') || 1;
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [replyMessage, setReplyMessage] = useState('');

  const fetchQueries = async () => {
    if (!mentorId) return;

    try {
      const res = await axios.get(`${API_BASE_URL}/api/chatbot/mentor/${mentorId}`);
      setQueries(res.data);
    } catch (err) {
      console.error('Failed to load mentor queries', err);
    }
  };

  const fetchMessages = async (queryId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/chatbot/messages/${queryId}`);
      setChatMessages(res.data);
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, [mentorId]);

  const handleSelectQuery = (query) => {
    setSelectedQuery(query);
    fetchMessages(query.id);
  };

  const sendReply = async () => {
    if (!selectedQuery || !replyMessage.trim()) return;

    try {
      await axios.post(`${API_BASE_URL}/api/chatbot/reply`, {
        query_id: selectedQuery.id,
        sender_id: mentorId,
        sender_role: 'mentor',
        message: replyMessage.trim()
      });

      setReplyMessage('');
      fetchMessages(selectedQuery.id);
      fetchQueries();
    } catch (err) {
      console.error('Failed to send reply', err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="lg:w-1/3">
          <div className="mb-5">
            <h1 className="text-3xl font-bold">Mentor Chatbot</h1>
            <p className="text-slate-600">View student queries and reply as a mentor.</p>
          </div>

          <div className="border rounded-3xl p-4 bg-white shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Student Queries</h2>
            {queries.length === 0 ? (
              <p className="text-sm text-slate-500">No student queries found yet.</p>
            ) : (
              <div className="space-y-3">
                {queries.map((query) => (
                  <button
                    key={query.id}
                    onClick={() => handleSelectQuery(query)}
                    className={`block w-full text-left rounded-2xl border p-4 transition ${selectedQuery?.id === query.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{query.title}</span>
                      <span className="text-xs text-slate-500 uppercase">{query.status}</span>
                    </div>
                    <p className="text-sm text-slate-600">Student: {query.student_name || 'Unknown'}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:w-2/3">
          <div className="border rounded-3xl p-6 bg-white shadow-sm h-full">
            <h2 className="text-2xl font-semibold mb-4">Chat</h2>
            {selectedQuery ? (
              <>
                <div className="mb-5 rounded-3xl border border-slate-200 p-4 bg-slate-50">
                  <h3 className="text-lg font-bold">{selectedQuery.title}</h3>
                  <p className="text-sm text-slate-600">Student: {selectedQuery.student_name || 'Unknown'}</p>
                </div>

                <div className="space-y-3 mb-5 max-h-[420px] overflow-y-auto">
                  {chatMessages.length === 0 ? (
                    <p className="text-sm text-slate-500">No messages yet. Send the first reply.</p>
                  ) : (
                    chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_role === 'mentor' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] rounded-3xl px-4 py-3 ${msg.sender_role === 'mentor' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-900'}`}>
                          <p className="text-sm">{msg.message}</p>
                          <p className="mt-2 text-[10px] uppercase tracking-[0.1em] text-slate-500">{msg.sender_role}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <textarea
                    rows="4"
                    className="w-full rounded-3xl border border-slate-200 p-4 text-sm focus:border-indigo-500 focus:outline-none"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply to the student here..."
                  />
                  <button
                    onClick={sendReply}
                    className="inline-flex items-center justify-center rounded-3xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Send Reply
                  </button>
                </div>
              </>
            ) : (
              <div className="text-slate-500">Select a student query from the list to view and respond.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorChatbot;
