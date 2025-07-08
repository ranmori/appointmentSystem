

// import React, { useState, useEffect } from "react";
// import NavBar from "../components/NavBar"; // Assuming you have a NavBar
// import { useNavigate } from "react-router-dom";
// import GetUserInfo from "../utils/GetUserInfo.jsx"; // To get user context if needed for the assessment

// export default function HealthAssessmentPage() {
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null); // To check if user is logged in
//   const [loadingUser, setLoadingUser] = useState(true);

//   const [assessmentForm, setAssessmentForm] = useState({
//     generalHealth: "", // e.g., "Excellent", "Good", "Fair", "Poor"
//     currentSymptoms: "", // Textarea for detailed symptoms
//     medicalHistory: "", // Textarea for past conditions/surgeries
//     medications: "", // Textarea for current medications
//     allergies: "", // Textarea for allergies
//     lifestyle: "", // e.g., "Active", "Sedentary", "Moderate"
//   });

//   const [submissionStatus, setSubmissionStatus] = useState({
//     message: "",
//     type: "", // "success" or "error"
//   });

//   // Fetch user info on component mount to ensure authentication
//   useEffect(() => {
//     const loadUser = async () => {
//       const userInfo = await GetUserInfo();
//       if (!userInfo || !userInfo.token) {
//         navigate("/login"); // Redirect if not logged in
//       } else {
//         setUser(userInfo);
//       }
//       setLoadingUser(false);
//     };
//     loadUser();
//   }, [navigate]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setAssessmentForm((prevForm) => ({
//       ...prevForm,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmissionStatus({ message: "", type: "" }); // Clear previous status

//     if (!user) {
//       setSubmissionStatus({ message: "You must be logged in to submit an assessment.", type: "error" });
//       navigate("/login");
//       return;
//     }

//     // In a real application, you would send this data to your backend
//     // For now, we'll just log it and simulate a successful submission.
//     try {
//       // Example: If you had a backend endpoint for health assessments:
//       // const response = await axios.post("http://localhost:3022/api/health-assessments", assessmentForm, {
//       //   headers: { Authorization: `Bearer ${user.token}` }
//       // });
//       // console.log("Health assessment submitted:", response.data);

//       console.log("Health Assessment Submitted:", assessmentForm);

//       setSubmissionStatus({ message: "Health assessment submitted successfully!", type: "success" });
//       // Optionally reset form after successful submission
//       setAssessmentForm({
//         generalHealth: "",
//         currentSymptoms: "",
//         medicalHistory: "",
//         medications: "",
//         allergies: "",
//         lifestyle: "",
//       });
//       // You could also navigate away after success
//       // setTimeout(() => navigate('/dashboard'), 2000);

//     } catch (error) {
//       console.error("Error submitting health assessment:", error);
//       setSubmissionStatus({ message: "Failed to submit assessment. Please try again.", type: "error" });
//       // More detailed error handling would go here based on error.response
//     }
//   };

//   if (loadingUser) {
//     return (
//       <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//         <p className="text-xl text-gray-600">Loading user data...</p>
//       </div>
//     );
//   }

//   return (
//     <>
//       <NavBar /> {/* Render your NavBar component */}
//       <div className="min-h-screen bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center p-4 py-12">
//         <div className="max-w-2xl w-full bg-white shadow-xl rounded-lg p-8 space-y-6 border border-gray-200">
//           <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
//             Health Assessment
//           </h1>
//           <p className="text-gray-700 text-center mb-8">
//             Please fill out this form to help us understand your health better. Your responses are confidential.
//           </p>

//           {submissionStatus.message && (
//             <div
//               className={`px-4 py-3 rounded-md ${
//                 submissionStatus.type === "success"
//                   ? "bg-green-100 text-green-700 border border-green-400"
//                   : "bg-red-100 text-red-700 border border-red-400"
//               }`}
//               role="alert"
//             >
//               {submissionStatus.message}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* General Health */}
//             <div>
//               <label htmlFor="generalHealth" className="block text-sm font-medium text-gray-700 mb-1">
//                 How would you describe your general health?
//               </label>
//               <select
//                 id="generalHealth"
//                 name="generalHealth"
//                 className="input input-bordered w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 value={assessmentForm.generalHealth}
//                 onChange={handleChange}
//                 required
//               >
//                 <option value="">-- Select --</option>
//                 <option value="Excellent">Excellent</option>
//                 <option value="Good">Good</option>
//                 <option value="Fair">Fair</option>
//                 <option value="Poor">Poor</option>
//               </select>
//             </div>

//             {/* Current Symptoms */}
//             <div>
//               <label htmlFor="currentSymptoms" className="block text-sm font-medium text-gray-700 mb-1">
//                 Describe any current symptoms or concerns you have:
//               </label>
//               <textarea
//                 id="currentSymptoms"
//                 name="currentSymptoms"
//                 className="textarea textarea-bordered w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-28 resize-y"
//                 value={assessmentForm.currentSymptoms}
//                 onChange={handleChange}
//                 placeholder="e.g., persistent cough, fatigue, stomach pain, headaches..."
//               ></textarea>
//             </div>

//             {/* Medical History */}
//             <div>
//               <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700 mb-1">
//                 Any significant past medical history (e.g., chronic conditions, surgeries)?
//               </label>
//               <textarea
//                 id="medicalHistory"
//                 name="medicalHistory"
//                 className="textarea textarea-bordered w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-28 resize-y"
//                 value={assessmentForm.medicalHistory}
//                 onChange={handleChange}
//                 placeholder="e.g., Diabetes, Hypertension, Appendectomy (1998)..."
//               ></textarea>
//             </div>

//             {/* Current Medications */}
//             <div>
//               <label htmlFor="medications" className="block text-sm font-medium text-gray-700 mb-1">
//                 List any medications you are currently taking:
//               </label>
//               <textarea
//                 id="medications"
//                 name="medications"
//                 className="textarea textarea-bordered w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-y"
//                 value={assessmentForm.medications}
//                 onChange={handleChange}
//                 placeholder="e.g., Aspirin 81mg daily, Insulin (brand) 10 units..."
//               ></textarea>
//             </div>

//             {/* Allergies */}
//             <div>
//               <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-1">
//                 Do you have any allergies (medications, food, environmental)?
//               </label>
//               <textarea
//                 id="allergies"
//                 name="allergies"
//                 className="textarea textarea-bordered w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-y"
//                 value={assessmentForm.allergies}
//                 onChange={handleChange}
//                 placeholder="e.g., Penicillin, Peanuts, Pollen..."
//               ></textarea>
//             </div>

//             {/* Lifestyle */}
//             <div>
//               <label htmlFor="lifestyle" className="block text-sm font-medium text-gray-700 mb-1">
//                 How would you describe your general lifestyle?
//               </label>
//               <select
//                 id="lifestyle"
//                 name="lifestyle"
//                 className="input input-bordered w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 value={assessmentForm.lifestyle}
//                 onChange={handleChange}
//                 required
//               >
//                 <option value="">-- Select --</option>
//                 <option value="Sedentary">Sedentary (Little to no exercise)</option>
//                 <option value="Moderate">Moderate (Some regular activity)</option>
//                 <option value="Active">Active (Regular, intense exercise)</option>
//               </select>
//             </div>

//             <button
//               type="submit"
//               className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
//             >
//               Submit Assessment
//             </button>
//           </form>
//         </div>
//       </div>
//     </>
//   );
// }