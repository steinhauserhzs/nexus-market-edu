import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import SEOHead from "@/components/ui/seo-head";
import NetflixDashboard from "./NetflixDashboard";


const Index = () => {
  // Redirect to Netflix Dashboard
  return <NetflixDashboard />;
};

export default Index;