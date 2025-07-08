import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion as Motion } from "framer-motion"; // Import motion as Motion

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

  // --- Framer Motion Animation Definitions ---

  // Gradient Background Animation
  const gradientAnimation = {
    animate: {
      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"], // Keyframes for background-position
    },
    transition: {
      duration: 8,
      ease: "linear",
      repeat: Infinity,
    },
  };

  // Text Scale Animation
  const textScaleVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: [0.8, 1.1, 1], // Keyframes for scale
      opacity: [0, 1, 1], // Keyframes for opacity
      transition: {
        duration: 0.8,
        ease: "easeOut",
        times: [0, 0.5, 1], // Corresponding times for keyframes
      },
    },
  };

  // Float Animation for small circles
  // Note: Framer Motion's 'transition' can include repeat settings directly
  const floatAnimation = {
    animate: {
      y: [0, -20, 0], // translateY(0px) -> translateY(-20px) -> translateY(0px)
      rotate: [0, 5, 0], // rotate(0deg) -> rotate(5deg) -> rotate(0deg)
    },
    transition: {
      ease: "linear", // Using linear for simplicity, can customize
      repeat: Infinity,
      repeatType: "loop",
      duration: (props) => props.duration, // Dynamic duration from style prop
      delay: (props) => props.delay, // Dynamic delay from style prop
    },
  };

  // Shine Animation for Button
  const shineAnimation = {
    animate: {
      backgroundPosition: ["0% center", "200% center"], // Animating background-position
    },
    transition: {
      duration: 3,
      ease: "linear",
      repeat: Infinity,
    },
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <Motion.div
        {...gradientAnimation} // Apply gradient animation
        className="absolute inset-0 bg-gradient-to-r 
          from-purple-500 via-pink-500 to-blue-500 bg-[length:400%_400%] 
          opacity-90 mix-blend-screen"
      />

      {/* Floating Elements */}
      <div className="absolute w-full h-full">
        {[...Array(6)].map((_, i) => (
          <Motion.div
            key={i}
            variants={floatAnimation} // Apply float animation
            animate="animate"
            custom={{ duration: Math.random() * 5 + 5, delay: i * 2 }} // Pass dynamic props
            className="absolute rounded-full bg-white/10"
            style={{
              width: `${Math.random() * 50 + 20}px`,
              height: `${Math.random() * 50 + 20}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Hero Content */}
      <div className="hero-content text-center relative z-10 p-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-8 animate-pulse">
            DOC MEET.
          </h1>

          <p className="py-6 text-lg sm:text-xl text-white/90">
            Get your appointment with us with the{" "}
            <Motion.span
              key={text} // Key changes when text changes, re-triggering animation
              variants={textScaleVariants}
              initial="hidden"
              animate="visible"
              className="inline-block bg-gradient-to-r from-yellow-400 to-pink-400 
                bg-clip-text text-transparent font-bold"
            >
              {text}
            </Motion.span>{" "}
            doctor in the world
          </p>

          {/* "Get Started" Button */}
          <Motion.button
            {...shineAnimation} // Apply shine animation
            className="btn btn-lg transform transition-all duration-300 
            hover:scale-110 hover:shadow-2xl bg-gradient-to-r from-blue-400 via-white to-purple-500 
            border-none text-white bg-[length:200%]"
            onClick={handleGetStarted}
          >
            Get Started
          </Motion.button>

          {!isLogged && (
            <div className="mt-4 text-white text-sm">
              Already have an account?{" "}
              <Link to="/login" className="font-bold hover:underline">
                Login
              </Link>
            </div>
          )}
          {isLogged && (
            <div className="mt-4 text-white text-sm">
              Continue to{" "}
              <Link to="/dashboard" className="font-bold hover:underline">
                Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
