import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from '../config';

const StudentChatbot = () => {

    const studentId = localStorage.getItem('studentId') || 1;
    const userId = localStorage.getItem('userId') || 2;

    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");

    const [queries, setQueries] = useState([]);
    const [selectedQuery, setSelectedQuery] = useState(null);

    const [chatMessages, setChatMessages] = useState([]);
    const [replyMessage, setReplyMessage] = useState("");



    // LOAD STUDENT QUERIES
    const fetchQueries = async () => {

        try {

            const res = await axios.get(
                `${API_BASE_URL}/api/chatbot/student/${studentId}`
            );

            setQueries(res.data);

        } catch (err) {
            console.log(err);
        }
    };



    // LOAD CHAT MESSAGES
    const fetchMessages = async (queryId) => {

        try {

            const res = await axios.get(
                `${API_BASE_URL}/api/chatbot/messages/${queryId}`
            );

            setChatMessages(res.data);

        } catch (err) {
            console.log(err);
        }
    };



    useEffect(() => {
        fetchQueries();
    }, []);




    // CREATE NEW QUERY
    const createQuery = async () => {

        if (!title || !message) {
            alert("Please fill all fields");
            return;
        }

        try {

            await axios.post(
                `${API_BASE_URL}/api/chatbot/create`,
                {
                    student_id: studentId,
                    mentor_id: 1,
                    sender_id: userId,
                    title,
                    message
                }
            );

            setTitle("");
            setMessage("");

            fetchQueries();

            alert("Query Sent Successfully");

        } catch (err) {
            console.log(err);
        }
    };



    // SEND NEW MESSAGE
    const sendReply = async () => {

        if (!replyMessage) return;

        try {

            await axios.post(
                `${API_BASE_URL}/api/chatbot/reply`,
                {
                    query_id: selectedQuery.id,
                    sender_id: userId,
                    sender_role: "student",
                    message: replyMessage
                }
            );

            setReplyMessage("");

            fetchMessages(selectedQuery.id);

        } catch (err) {
            console.log(err);
        }
    };



    return (

        <div className="p-6">

            <h1 className="text-3xl font-bold mb-6">
                Student Support Chatbot
            </h1>



            {/* CREATE QUERY */}

            <div className="border rounded-lg p-4 mb-8">

                <h2 className="text-xl font-semibold mb-4">
                    Create New Query
                </h2>

                <input
                    type="text"
                    placeholder="Enter Query Title"
                    className="border w-full p-2 mb-4 rounded"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <textarea
                    placeholder="Explain your problem"
                    className="border w-full p-2 mb-4 rounded"
                    rows="4"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />

                <button
                    onClick={createQuery}
                    className="bg-blue-600 text-white px-5 py-2 rounded"
                >
                    Send Query
                </button>

            </div>



            {/* QUERY LIST */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* LEFT SIDE */}

                <div>

                    <h2 className="text-xl font-semibold mb-4">
                        My Queries
                    </h2>

                    {
                        queries.map((query) => (

                            <div
                                key={query.id}
                                onClick={() => {
                                    setSelectedQuery(query);
                                    fetchMessages(query.id);
                                }}
                                className="border rounded p-4 mb-3 cursor-pointer hover:bg-gray-100"
                            >

                                <h3 className="font-bold">
                                    {query.title}
                                </h3>

                                <p className="text-sm text-gray-500">
                                    Status : {query.status}
                                </p>

                            </div>
                        ))
                    }

                </div>



                {/* RIGHT SIDE CHAT */}

                <div>

                    <h2 className="text-xl font-semibold mb-4">
                        Chat Messages
                    </h2>

                    <div className="border rounded p-4 h-[400px] overflow-y-auto mb-4">

                        {
                            chatMessages.map((msg) => (

                                <div
                                    key={msg.id}
                                    className={`mb-3 ${
                                        msg.sender_role === "student"
                                            ? "text-right"
                                            : "text-left"
                                    }`}
                                >

                                    <div
                                        className={`inline-block px-4 py-2 rounded-lg ${
                                            msg.sender_role === "student"
                                                ? "bg-blue-500 text-white"
                                                : "bg-gray-200"
                                        }`}
                                    >

                                        {msg.message}

                                    </div>

                                </div>
                            ))
                        }

                    </div>



                    {
                        selectedQuery && (

                            <div className="flex gap-2">

                                <input
                                    type="text"
                                    placeholder="Type message..."
                                    className="border flex-1 p-2 rounded"
                                    value={replyMessage}
                                    onChange={(e) =>
                                        setReplyMessage(e.target.value)
                                    }
                                />

                                <button
                                    onClick={sendReply}
                                    className="bg-green-600 text-white px-4 rounded"
                                >
                                    Send
                                </button>

                            </div>
                        )
                    }

                </div>

            </div>

        </div>
    );
};

export default StudentChatbot;