import React from "react";
import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <>
      <div
        className="min-h-screen bg-gradient-to-r 
          from-purple-500 via-pink-500 to-blue-500 m-0
         py-12 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-8 sm:p-10">
            <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-8">
              About DOC MEET.
            </h1>

            {/* Revised Introduction Section */}
            <section className="mb-10 text-lg text-gray-700 leading-relaxed">
              <p className="mb-4">
                Welcome to **DOC MEET.**, your premier platform for connecting
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
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">
                Our Mission
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed text-center italic">
                "To revolutionize healthcare access by seamlessly connecting
                patients with qualified doctors, fostering well-being through
                convenience, compassion, and cutting-edge technology."
              </p>
            </section>

            {/* Our Core Values Section (remains the same) */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                Our Core Values
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
                <div className="flex items-start">
                  <span className="text-blue-600 text-2xl mr-3">✔</span>
                  <div>
                    <h3 className="font-semibold text-xl mb-1">
                      Patient-Centered Care
                    </h3>
                    <p>
                      Your health and comfort are our top priorities. We listen,
                      understand, and tailor treatments to your unique needs.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-600 text-2xl mr-3">✔</span>
                  <div>
                    <h3 className="font-semibold text-xl mb-1">Excellence</h3>
                    <p>
                      We are committed to the highest standards of medical
                      practice, continuously learning and adopting best
                      practices.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-600 text-2xl mr-3">✔</span>
                  <div>
                    <h3 className="font-semibold text-xl mb-1">Compassion</h3>
                    <p>
                      We treat every patient with empathy, respect, and dignity,
                      creating a supportive and healing environment.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-600 text-2xl mr-3">✔</span>
                  <div>
                    <h3 className="font-semibold text-xl mb-1">Integrity</h3>
                    <p>
                      We operate with honesty, transparency, and ethical
                      responsibility in all our interactions and decisions.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Our Team (Optional) */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                Meet Our Team
              </h2>
              <p className="text-lg text-gray-700 text-center mb-6">
                Behind DOC MEET. is a passionate team dedicated to building and
                maintaining a seamless platform that connects you with the best
                healthcare professionals.
              </p>
            </section>

            {/* Call to Action */}
            <div className="text-center pt-8 border-t border-gray-200 mt-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Ready to Connect with a Doctor?
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Experience the convenience of modern healthcare. Find the right
                specialist and book your appointment today.
              </p>
              <Link
                to="/book"
                className="inline-block bg-blue-200 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
              >
                Book an Appointment
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
