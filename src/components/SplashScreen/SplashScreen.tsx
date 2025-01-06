// components/SplashScreen.tsx
import React from "react";
import { motion } from "framer-motion";

const SplashScreen: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-blue-700">
      <motion.h1
        className="text-4xl font-bold text-white"
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: "auto" }}
        transition={{ duration: 2, ease: "easeInOut" }}
        style={{ overflow: "hidden", whiteSpace: "nowrap", borderRight: "3px solid white" }}
      >
        Martins Poços Semi-Artesiano
      </motion.h1>
  
    </div>
  );
};

export default SplashScreen;
