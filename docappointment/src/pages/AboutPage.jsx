import React from "react";
import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-teal-100">
        <div className="p-8 sm:p-12">
          <h1 className="text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            About DOC MEET.
          </h1>

          {/* Introduction Section */}
          <section className="mb-12 text-lg text-gray-700 leading-relaxed">
            <p className="mb-5">
              Welcome to <span className="font-bold text-teal-600">DOC MEET.</span>, your premier platform for connecting
              with qualified doctors and managing your healthcare
              effortlessly. We're dedicated to making healthcare accessible
              and convenient, allowing you to find, schedule, and meet with
              trusted healthcare professionals from the comfort of your home
              or on the go.
            </p>
            <p>
              Our service is built on the belief that timely, personal, and
              efficient medical advice should be just a few clicks away. DOC
              MEET. bridges the gap between patients seeking care and doctors
              providing expert guidance, ensuring you get the support you
              need, when you need it.
            </p>
          </section>

          {/* Our Mission Section */}
          <section className="mb-12 bg-gradient-to-r from-teal-50 to-cyan-50 p-8 rounded-2xl border border-teal-200">
            <h2 className="text-3xl font-bold text-gray-800 mb-5 text-center">
              Our Mission
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed text-center italic">
              "To revolutionize healthcare access by seamlessly connecting
              patients with qualified doctors, fostering well-being through
              convenience, compassion, and cutting-edge technology."
            </p>
          </section>

          {/* Our Core Values Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              Our Core Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-700">
              <div className="flex items-start bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-xl border border-teal-200 hover:shadow-lg transition-all">
                <span className="text-teal-600 text-3xl mr-4 font-bold">✔</span>
                <div>
                  <h3 className="font-bold text-xl mb-2 text-teal-700">
                    Patient-Centered Care
                  </h3>
                  <p>
                    Your health and comfort are our top priorities. We listen,
                    understand, and tailor treatments to your unique needs.
                  </p>
                </div>
              </div>
              <div className="flex items-start bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-xl border border-cyan-200 hover:shadow-lg transition-all">
                <span className="text-cyan-600 text-3xl mr-4 font-bold">✔</span>
                <div>
                  <h3 className="font-bold text-xl mb-2 text-cyan-700">Excellence</h3>
                  <p>
                    We are committed to the highest standards of medical
                    practice, continuously learning and adopting best
                    practices.
                  </p>
                </div>
              </div>
              <div className="flex items-start bg-gradient-to-br from-blue-50 to-teal-50 p-6 rounded-xl border border-blue-200 hover:shadow-lg transition-all">
                <span className="text-blue-600 text-3xl mr-4 font-bold">✔</span>
                <div>
                  <h3 className="font-bold text-xl mb-2 text-blue-700">Compassion</h3>
                  <p>
                    We treat every patient with empathy, respect, and dignity,
                    creating a supportive and healing environment.
                  </p>
                </div>
              </div>
              <div className="flex items-start bg-gradient-to-br from-teal-50 to-blue-50 p-6 rounded-xl border border-teal-200 hover:shadow-lg transition-all">
                <span className="text-teal-600 text-3xl mr-4 font-bold">✔</span>
                <div>
                  <h3 className="font-bold text-xl mb-2 text-teal-700">Integrity</h3>
                  <p>
                    We operate with honesty, transparency, and ethical
                    responsibility in all our interactions and decisions.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Our Team */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-700 text-center mb-6 leading-relaxed">
              Behind DOC MEET. is a passionate team dedicated to building and
              maintaining a seamless platform that connects you with the best
              healthcare professionals.
            </p>
          </section>

          {/* Call to Action */}
          <div className="text-center pt-8 border-t-2 border-teal-100 mt-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-5">
              Ready to Connect with a Doctor?
            </h2>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Experience the convenience of modern healthcare. Find the right
              specialist and book your appointment today.
            </p>
            <Link
              to="/book"
              className="inline-block bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-10 py-4 rounded-xl text-xl font-bold hover:from-teal-600 hover:to-cyan-700 transition duration-300 ease-in-out transform hover:scale-105 shadow-xl"
            >
              Book an Appointment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}