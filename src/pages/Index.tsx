import React from "react";
import { LevelAssessment } from "@/components/LevelAssessment";
import Dashboard from "@/pages/Dashboard";
import { useLearning } from "@/context/LearningContext";

const Index = () => {
  const { hasCompletedAssessment } = useLearning();

  if (!hasCompletedAssessment) {
    return <LevelAssessment />;
  }

  return <Dashboard />;
};

export default Index;
