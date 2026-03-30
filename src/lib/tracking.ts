import { useState, useEffect } from 'react';
import { generateIntel, models } from './gemini';

export interface TrackedTarget {
  id: string;
  name: string;
  lastChecked: number;
}

export interface Alert {
  id: string;
  targetName: string;
  finding: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high';
}

export function useTracking() {
  const [trackedTargets, setTrackedTargets] = useState<TrackedTarget[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const trackTarget = (name: string) => {
    if (trackedTargets.find(t => t.name === name)) return;
    const newTarget = { id: Math.random().toString(36).substr(2, 9), name, lastChecked: Date.now() };
    setTrackedTargets(prev => [...prev, newTarget]);
  };

  const untrackTarget = (id: string) => {
    setTrackedTargets(prev => prev.filter(t => t.id !== id));
  };

  // Simulate real-time intelligence gathering
  useEffect(() => {
    if (trackedTargets.length === 0) return;

    const interval = setInterval(async () => {
      const randomTarget = trackedTargets[Math.floor(Math.random() * trackedTargets.length)];
      
      try {
        const prompt = `Generate a brief, urgent OSINT alert for the tracked target: "${randomTarget.name}". 
        The alert should sound like a new finding from a Discord leak, a Runehall transaction, or a Twitter mention. 
        Keep it under 100 characters.`;
        
        const response = await generateIntel(prompt, models.lite);
        const finding = response.text || "New activity detected on underground forums.";

        const newAlert: Alert = {
          id: Math.random().toString(36).substr(2, 9),
          targetName: randomTarget.name,
          finding,
          timestamp: Date.now(),
          severity: Math.random() > 0.7 ? 'high' : 'medium',
        };

        setAlerts(prev => [newAlert, ...prev].slice(0, 10));
      } catch (error) {
        console.error("Alert generation failed:", error);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [trackedTargets]);

  return { trackedTargets, alerts, trackTarget, untrackTarget, setAlerts };
}
