import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";

export default function Landing() {
  const [text, setText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const words = React.useMemo(
    () => ["best", "top", "most experienced", "leading", "qualified"],
    []
  );

  const navigate = useNavigate();
  const isLogged = localStorage.getItem("token");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [words.length]);

  useEffect(() => {
    setText(words[currentIndex]);
  }, [currentIndex, words]);

  const handleGetStarted = () => {
    if (isLogged) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  const gradientAnimation = {
    animate: {
      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    },
    transition: {
      duration: 10,
      ease: "linear",
      repeat: Infinity,
    },
  };

  const textScaleVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: [0.8, 1.05, 1],
      opacity: [0, 1, 1],
      transition: {
        duration: 0.6,
        ease: "easeOut",
        times: [0, 0.6, 1],
      },
    },
  };

  const floatAnimation = {
    animate: {
      y: [0, -15, 0],
      rotate: [0, 3, 0],
    },
    transition: {
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop",
      duration: (props) => props.duration,
      delay: (props) => props.delay,
    },
  };

  const shineAnimation = {
    animate: {
      backgroundPosition: ["0% center", "200% center"],
    },
    transition: {
      duration: 3,
      ease: "linear",
      repeat: Infinity,
    },
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50">
      {/* Soft animated background overlay */}
      <Motion.div
        {...gradientAnimation}
        className="absolute inset-0 bg-gradient-to-r 
          from-teal-400/30 via-blue-400/20 to-cyan-400/30 bg-[length:400%_400%] 
          opacity-70"
      />

      {/* Floating Elements - softer, medical-themed colors */}
      <div className="absolute w-full h-full">
        {[...Array(6)].map((_, i) => (
          <Motion.div
            key={i}
            variants={floatAnimation}
            animate="animate"
            custom={{ duration: Math.random() * 6 + 6, delay: i * 1.5 }}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 60 + 30}px`,
              height: `${Math.random() * 60 + 30}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 2 === 0 
                ? 'radial-gradient(circle, rgba(56, 178, 172, 0.15) 0%, rgba(56, 178, 172, 0.05) 100%)'
                : 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)',
            }}
          />
        ))}
      </div>

      {/* Hero Content */}
      <div className="hero-content text-center relative z-10 p-4">
        <div className="max-w-3xl mx-auto">
          <Motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6"
            style={{
              background: 'linear-gradient(135deg, #0891b2 0%, #3b82f6 50%, #14b8a6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            DOC MEET.
          </Motion.h1>

          <Motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="py-6 text-xl sm:text-2xl text-gray-700 leading-relaxed"
          >
            Get your appointment with the{" "}
            <Motion.span
              key={text}
              variants={textScaleVariants}
              initial="hidden"
              animate="visible"
              className="inline-block font-bold"
              style={{
                background: 'linear-gradient(135deg, #14b8a6 0%, #0891b2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {text}
            </Motion.span>{" "}
            doctors in your area
          </Motion.p>

          {/* Get Started Button */}
          <Motion.button
            {...shineAnimation}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="btn btn-lg px-10 py-4 text-lg font-semibold rounded-full
            shadow-xl hover:shadow-2xl transition-all duration-300
            text-white bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 
            border-none bg-[length:200%] relative overflow-hidden"
            onClick={handleGetStarted}
          >
            <span className="relative z-10">Get Started</span>
          </Motion.button>

          {!isLogged && (
            <Motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-6 text-gray-600 text-base"
            >
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700 hover:underline transition-colors">
                Login
              </Link>
            </Motion.div>
          )}
          {isLogged && (
            <Motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-6 text-gray-600 text-base"
            >
              Continue to{" "}
              <Link to="/dashboard" className="font-semibold text-teal-600 hover:text-teal-700 hover:underline transition-colors">
                Dashboard
              </Link>
            </Motion.div>
          )}
        </div>
      </div>
    </div>
  );
}