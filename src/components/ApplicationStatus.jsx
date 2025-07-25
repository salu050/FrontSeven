import React, { useState, useEffect } from 'react';
import axios from '../api/axiosConfig.jsx'; // Import the configured axios instance
import { FaCheckCircle, FaTimesCircle, FaRegSmileBeam, FaSpinner, FaInfoCircle, FaClipboard } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// For LLM integration
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=";
const API_KEY = ""; // Canvas will inject the API key at runtime

// FIXED: Added onSubmitDetails to the destructured props with a default empty function
const ApplicationStatus = ({ userDetails, onSubmitDetails = () => {} }) => {
  const [applicationDetails, setApplicationDetails] = useState(userDetails?.applicationDetails || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(true); // Toggle for application details
  const [showChat, setShowChat] = useState(false); // Toggle for chat widget
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Sample data for the chart (replace with real data if available from backend)
  const chartData = [
    { name: 'Jan', applications: 4000, accepted: 2400 },
    { name: 'Feb', applications: 3000, accepted: 1398 },
    { name: 'Mar', applications: 2000, accepted: 9800 },
    { name: 'Apr', applications: 2780, accepted: 3908 },
    { name: 'May', applications: 1890, accepted: 4800 },
    { name: 'Jun', applications: 2390, accepted: 3800 },
    { name: 'Jul', applications: 3490, accepted: 4300 },
  ];

  // Dynamic CSS Injection for Bootstrap and custom styles
  useEffect(() => {
    const bootstrapLink = document.createElement('link');
    bootstrapLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css';
    bootstrapLink.rel = 'stylesheet';
    bootstrapLink.integrity = 'sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM';
    bootstrapLink.crossOrigin = 'anonymous';
    document.head.appendChild(bootstrapLink);

    // FIXED: Updated Font Awesome version and integrity hash
    const fontAwesomeLink = document.createElement('link');
    fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
    fontAwesomeLink.rel = 'stylesheet';
    fontAwesomeLink.integrity = 'sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==';
    fontAwesomeLink.crossOrigin = 'anonymous';
    document.head.appendChild(fontAwesomeLink);

    const id = "application-status-style";
    let style = document.getElementById(id);
    if (!style) {
      style = document.createElement("style");
      style.id = id;
      style.innerHTML = `
        body { background-color: #eef2f6; }
        .status-container {
          background: linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%);
          min-height: 100vh;
          padding: 30px 0;
        }
        .status-card {
          background-color: #ffffff;
          border-radius: 15px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          margin-bottom: 25px;
        }
        .status-header {
          background: linear-gradient(90deg, #6366f1, #38bdf8);
          color: white;
          padding: 20px;
          text-align: center;
          font-size: 1.5rem;
          font-weight: 600;
        }
        .status-icons {
          display: flex;
          justify-content: space-around;
          padding: 20px 0;
          background-color: #f8faff;
          border-bottom: 1px solid #e0e7ff;
        }
        .status-icon-item {
          text-align: center;
          color: #6c757d;
          font-size: 0.9rem;
          font-weight: 500;
          position: relative;
        }
        .status-icon-item .icon {
          font-size: 2.2rem;
          margin-bottom: 8px;
          color: #ced4da;
        }
        .status-icon-item.active .icon {
          color: #6366f1;
        }
        .status-icon-item.active .status-label {
          color: #6366f1;
          font-weight: bold;
        }
        .status-icon-item.active::after {
          content: '';
          position: absolute;
          bottom: -15px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-bottom: 8px solid #6366f1;
        }
        .status-message-box {
          background-color: #e6f7ff;
          border-left: 5px solid #2196f3;
          color: #0d47a1;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 1.1rem;
        }
        .status-message-box.success {
          background-color: #e8f5e9;
          border-left-color: #4caf50;
          color: #1b5e20;
        }
        .status-message-box.warning {
          background-color: #fff3e0;
          border-left-color: #ff9800;
          color: #e65100;
        }
        .status-message-box.danger {
          background-color: #ffebee;
          border-left-color: #f44336;
          color: #b71c1c;
        }
        .details-card {
          background-color: #f8faff;
          border-radius: 10px;
          padding: 20px;
          box-shadow: inset 0 0 10px rgba(0,0,0,0.05);
          border: 1px solid #e0e7ff;
        }
        .details-card ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .details-card ul li {
          padding: 8px 0;
          border-bottom: 1px dashed #e0e7ff;
          color: #495057;
        }
        .details-card ul li:last-child {
          border-bottom: none;
        }
        .details-card ul li strong {
          color: #343a40;
        }
        .chat-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 350px;
          height: 450px;
          background-color: #fff;
          border-radius: 15px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 1000;
        }
        .chat-header {
          background: linear-gradient(90deg, #6366f1, #38bdf8);
          color: white;
          padding: 15px;
          font-weight: 600;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top-left-radius: 15px;
          border-top-right-radius: 15px;
        }
        .chat-body {
          flex-grow: 1;
          padding: 15px;
          overflow-y: auto;
          background-color: #f9f9f9;
          display: flex;
          flex-direction: column;
        }
        .chat-message {
          max-width: 80%;
          padding: 10px 15px;
          border-radius: 15px;
          margin-bottom: 10px;
          word-wrap: break-word;
        }
        .chat-message.user {
          align-self: flex-end;
          background-color: #e0e7ff;
          color: #333;
          border-bottom-right-radius: 5px;
        }
        .chat-message.model {
          align-self: flex-start;
          background-color: #f0f2f5;
          color: #333;
          border-bottom-left-radius: 5px;
        }
        .chat-input-area {
          padding: 10px 15px;
          border-top: 1px solid #eee;
          display: flex;
          align-items: center;
        }
        .chat-input-area input {
          flex-grow: 1;
          border: 1px solid #ddd;
          border-radius: 20px;
          padding: 8px 15px;
          margin-right: 10px;
        }
        .chat-input-area button {
          border-radius: 20px;
        }
        .chat-toggle-btn {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: linear-gradient(90deg, #6366f1, #38bdf8);
          color: white;
          border: none;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          font-size: 1.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          z-index: 1001;
          cursor: pointer;
        }
        @media (max-width: 768px) {
          .chat-widget {
            width: 90%;
            height: 70vh;
            left: 5%;
            right: 5%;
            bottom: 10px;
          }
          .chat-toggle-btn {
            width: 50px;
            height: 50px;
            font-size: 1.5rem;
            bottom: 10px;
            right: 10px;
          }
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      document.head.removeChild(bootstrapLink);
      document.head.removeChild(fontAwesomeLink);
      if (document.getElementById(id)) {
        document.head.removeChild(document.getElementById(id));
      }
    };
  }, []);

  // Fetch application details on component mount or userDetails change
  useEffect(() => {
    const fetchApplicationDetails = async () => {
      if (!userDetails || !userDetails.id) {
        setIsLoading(false);
        setError('User details not available. Please log in.');
        return;
      }

      setIsLoading(true);
      setError('');
      try {
        // Assuming backend endpoint to get application details for the current user
        // This should be the /api/applications/user/{userId} endpoint
        const response = await axios.get(`/applications/user/${userDetails.id}`);
        const data = response.data; // This should be the full ApplicationForm object

        if (data) {
          setApplicationDetails(data);
          // Also update App.jsx's state if applicationDetails was just fetched/updated
          // Ensure onSubmitDetails is a function before calling it
          if (onSubmitDetails && typeof onSubmitDetails === 'function' && userDetails.applicationDetails !== data) {
            onSubmitDetails({ ...userDetails, applicationDetails: data });
          }
        } else {
          // If no data is returned, it means no application was found for the user
          setError('No application details found for this user.');
          setApplicationDetails(null);
        }
      } catch (err) {
        console.error("Error fetching application details:", err);
        // More specific error message for 404 (Not Found)
        if (err.response && err.response.status === 404) {
          setError('You have not submitted an application form yet.');
        } else {
          setError(err.response?.data?.message || err.message || 'Failed to load application status.');
        }
        setApplicationDetails(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplicationDetails();
    // Poll for updates every 10 seconds (adjust as needed)
    const interval = setInterval(fetchApplicationDetails, 10000);
    return () => clearInterval(interval);
  }, [userDetails, onSubmitDetails]); // Depend on userDetails and onSubmitDetails

  // Function to send message to LLM
  const sendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const newUserMessage = { role: "user", parts: [{ text: chatInput }] };
    const updatedChatHistory = [...chatHistory, newUserMessage];
    setChatHistory(updatedChatHistory);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const payload = { contents: updatedChatHistory };
      const response = await fetch(GEMINI_API_URL + API_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const modelResponseText = result.candidates[0].content.parts[0].text;
        setChatHistory(prev => [...prev, { role: "model", parts: [{ text: modelResponseText }] }]);
      } else {
        setChatHistory(prev => [...prev, { role: "model", parts: [{ text: "Sorry, I couldn't get a response. Please try again." }] }]);
        console.error("Unexpected LLM response structure:", result);
      }
    } catch (err) {
      console.error("Error calling LLM:", err);
      setChatHistory(prev => [...prev, { role: "model", parts: [{ text: "There was an error communicating with the AI. Please try again later." }] }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleCopyDetails = () => {
    if (!applicationDetails) return;
    const detailsText = `
      Application ID: ${applicationDetails.id || 'N/A'}
      Full Name: ${applicationDetails.fullName || 'N/A'}
      Preferred Center: ${applicationDetails.selectedCenter || 'N/A'}
      Admin Selected Center: ${applicationDetails.adminSelectedCenter || 'N/A'}
      Admin Selected Course ID: ${applicationDetails.adminSelectedCourseId || 'N/A'}
      Application Status: ${applicationDetails.applicationStatus || 'N/A'}
      Submitted on: ${applicationDetails.createdAt ? new Date(applicationDetails.createdAt).toLocaleString() : 'N/A'}
      Last Updated: ${applicationDetails.updatedAt ? new Date(applicationDetails.updatedAt).toLocaleString() : 'N/A'}
    `;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(detailsText.trim()).then(() => {
        alert('Application details copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy details. Please try manually.');
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = detailsText.trim();
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        alert('Application details copied to clipboard!');
      } catch (err) {
        console.error('Fallback copy failed: ', err);
        alert('Failed to copy details. Please try manually.');
      }
      document.body.removeChild(textArea);
    }
  };

  if (isLoading) {
    return (
      <div className="status-container d-flex align-items-center justify-content-center">
        <div className="text-center">
          <FaSpinner className="fa-spin fa-3x text-primary" />
          <p className="mt-3 text-secondary">Loading application status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="status-container d-flex align-items-center justify-content-center">
        <div className="alert alert-danger text-center">
          <FaTimesCircle className="me-2" /> {error}
          {error === 'You have not submitted an application form yet.' && (
            <p className="mt-2">Please navigate to the Application Form to apply.</p>
          )}
          {error !== 'You have not submitted an application form yet.' && (
            <p className="mt-2">Please ensure you are logged in correctly or contact support.</p>
          )}
        </div>
      </div>
    );
  }

  // Determine current status for icon highlighting
  // Backend sends applicationStatus as an enum string (e.g., "SUBMITTED", "SELECTED")
  const currentStatus = applicationDetails?.applicationStatus || 'NOT_SUBMITTED'; // Use applicationStatus from backend

  const statusIcons = [
    { label: 'Submitted', icon: 'fas fa-paper-plane', status: 'SUBMITTED' },
    { label: 'Under Review', icon: 'fas fa-search', status: 'UNDER_REVIEW' },
    { label: 'Selected', icon: 'fas fa-check-circle', status: 'SELECTED' },
    { label: 'Rejected', icon: 'fas fa-times-circle', status: 'REJECTED' },
  ];

  return (
    <div className="status-container">
      <div className="container">
        {/* Header and Status Icons */}
        <div className="status-card">
          <div className="status-header">Application Status</div>
          <div className="status-icons">
            {statusIcons.map((item) => (
              <div key={item.status} className={`status-icon-item ${currentStatus === item.status ? 'active' : ''}`}>
                <i className={item.icon + ' icon'}></i>
                <div className="status-label">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Conditional Messages */}
        {currentStatus === 'SELECTED' && (
          <div className="status-message-box success mb-4">
            <FaCheckCircle className="me-2" /> Your dedication has paid off! Welcome to a new chapter of learning and growth!
            <p className="mb-0 mt-2">
              You have been selected to join VETA {applicationDetails?.adminSelectedCenter || 'N/A'}.
              Please check your email for further instructions.
            </p>
          </div>
        )}
        {currentStatus === 'SUBMITTED' && (
          <div className="status-message-box info mb-4">
            <FaInfoCircle className="me-2" /> Your application has been submitted and is awaiting review.
            <p className="mb-0 mt-2">We will notify you of any updates via email and on this page.</p>
          </div>
        )}
        {currentStatus === 'UNDER_REVIEW' && (
          <div className="status-message-box warning mb-4">
            <FaInfoCircle className="me-2" /> Your application is currently under review.
            <p className="mb-0 mt-2">Please check back later for updates.</p>
          </div>
        )}
        {currentStatus === 'REJECTED' && (
          <div className="status-message-box danger mb-4">
            <FaTimesCircle className="me-2" /> We regret to inform you that your application was not successful at this time.
            <p className="mb-0 mt-2">Please contact support for more information or consider reapplying next cycle.</p>
          </div>
        )}
        {/* Removed NOT_SUBMITTED message here, as it's handled by the 'error' state now */}

        {/* Application Details Section */}
        {applicationDetails && (
          <div className="status-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Application Details</h5>
              <button className="btn btn-sm btn-outline-primary" onClick={() => setShowDetails(!showDetails)}>
                {showDetails ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
            {showDetails && (
              <div className="details-card">
                <ul>
                  <li><strong>Application ID:</strong> {applicationDetails.id || 'N/A'}</li>
                  <li><strong>Full Name:</strong> {applicationDetails.fullName || 'N/A'}</li>
                  <li><strong>Date of Birth:</strong> {applicationDetails.dateOfBirth ? new Date(applicationDetails.dateOfBirth).toLocaleDateString() : 'N/A'}</li>
                  <li><strong>Gender:</strong> {applicationDetails.gender || 'N/A'}</li>
                  <li><strong>Nationality:</strong> {applicationDetails.nationality || 'N/A'}</li>
                  <li><strong>ID Type:</strong> {applicationDetails.idType || 'N/A'}</li>
                  <li><strong>ID Number:</strong> {applicationDetails.idNumber || 'N/A'}</li>
                  <li><strong>Contact Phone:</strong> {applicationDetails.contactPhone || 'N/A'}</li>
                  <li><strong>Contact Email:</strong> {applicationDetails.contactEmail || 'N/A'}</li>
                  <li><strong>Education Level:</strong> {applicationDetails.educationLevel || 'N/A'}</li>
                  <li><strong>Previous School:</strong> {applicationDetails.previousSchool || 'N/A'}</li>
                  <li><strong>Preferred VETA Center:</strong> {applicationDetails.selectedCenter || 'N/A'}</li>
                  {applicationDetails.preferredCourses && applicationDetails.preferredCourses.length > 0 && (
                    <li><strong>Preferred Courses:</strong> {applicationDetails.preferredCourses.map(courseId => {
                        // Map course IDs back to names if you have a lookup, otherwise display ID
                        const course = (
                            [
                                { id: 1, name: 'Welding and Fabrication' },
                                { id: 2, name: 'Electrical Installation' },
                                { id: 3, name: 'Carpentry and Joinery' },
                                { id: 4, name: 'Plumbing' },
                                { id: 5, name: 'Tailoring and Dressmaking' },
                                { id: 6, name: 'Automotive Mechanics' },
                                { id: 7, name: 'ICT' },
                                { id: 8, name: 'Hotel Management' },
                            ]
                        ).find(c => c.id === courseId);
                        return course ? course.name : `Course ${courseId}`;
                    }).join(', ')}</li>
                  )}
                  {/* Admin Selected Course and Center */}
                  {applicationDetails.adminSelectedCenter && (
                    <li><strong>Selected Center (Admin):</strong> {applicationDetails.adminSelectedCenter}</li>
                  )}
                  {applicationDetails.adminSelectedCourseId && (
                    <li><strong>Selected Course (Admin):</strong> {
                        // Map course ID back to name
                        (
                            [
                                { id: 1, name: 'Welding and Fabrication' },
                                { id: 2, name: 'Electrical Installation' },
                                { id: 3, name: 'Carpentry and Joinery' },
                                { id: 4, name: 'Plumbing' },
                                { id: 5, name: 'Tailoring and Dressmaking' },
                                { id: 6, name: 'Automotive Mechanics' },
                                { id: 7, name: 'ICT' },
                                { id: 8, name: 'Hotel Management' },
                            ]
                        ).find(c => c.id === applicationDetails.adminSelectedCourseId)?.name || `Course ${applicationDetails.adminSelectedCourseId}`
                    }</li>
                  )}
                  <li><strong>Submitted on:</strong> {applicationDetails.createdAt ? new Date(applicationDetails.createdAt).toLocaleString() : 'N/A'}</li>
                  <li><strong>Last Updated:</strong> {applicationDetails.updatedAt ? new Date(applicationDetails.updatedAt).toLocaleString() : 'N/A'}</li>
                  <li><strong>Status Code:</strong> {applicationDetails.applicationStatus || 'N/A'}</li> {/* Use applicationStatus */}
                </ul>
                <div className="text-end mt-3">
                  <button className="btn btn-outline-secondary btn-sm" onClick={handleCopyDetails}>
                    <FaClipboard className="me-1" /> Copy Details
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chart Section */}
        <div className="status-card p-4">
            <h5 className="mb-3 text-secondary text-center">Application Trends (Sample Data)</h5>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="applications" stroke="#6366f1" activeDot={{ r: 8 }} name="Total Applications" />
                    <Line type="monotone" dataKey="accepted" stroke="#10b981" name="Accepted Applications" />
                </LineChart>
            </ResponsiveContainer>
            <p className="text-muted small text-center mt-3">
                This chart shows sample data. In a real scenario, this would display
                trends related to your application, e.g., progress through stages.
            </p>
        </div>

        {/* Support Chat Toggle Button */}
        {!showChat && (
          <button className="chat-toggle-btn" onClick={() => setShowChat(true)}>
            <i className="fas fa-comments"></i>
          </button>
        )}

        {/* Support Chat Widget */}
        {showChat && (
          <div className="chat-widget">
            <div className="chat-header">
              Support Chat
              <button className="btn btn-sm btn-link text-white" onClick={() => setShowChat(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="chat-body">
              {chatHistory.map((msg, index) => (
                <div key={index} className={`chat-message ${msg.role}`}>
                  {msg.parts[0].text}
                </div>
              ))}
              {isChatLoading && (
                <div className="chat-message model">
                  <FaSpinner className="fa-spin me-2" /> Typing...
                </div>
              )}
            </div>
            <div className="chat-input-area">
              <input
                type="text"
                placeholder="Type your message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') sendMessage(); }}
                disabled={isChatLoading}
              />
              <button className="btn btn-primary" onClick={sendMessage} disabled={isChatLoading}>
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationStatus;
