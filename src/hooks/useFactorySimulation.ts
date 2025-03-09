
import { useState, useEffect } from 'react';
import { SimulationHookProps } from '@/types/simulation';
import { useAnimationLoop } from './useAnimationLoop';

export const useFactorySimulation = ({
  isSimulating,
  simulationMode = "instant",
  simulationSpeed = 1,
  onUnitPositionUpdate
}: SimulationHookProps) => {
  const [currentUnitPosition, setCurrentUnitPosition] = useState<{ nodeId: string, progress: number } | null>(null);
  
  // Initialize animation loop hook
  const { 
    startPlayByPlayAnimation, 
    stopAnimation 
  } = useAnimationLoop(
    isSimulating,
    simulationSpeed,
    onUnitPositionUpdate || setCurrentUnitPosition
  );
  
  // Start or stop simulation based on props
  useEffect(() => {
    if (isSimulating && simulationMode === "play-by-play") {
      startPlayByPlayAnimation();
    } else if (!isSimulating) {
      stopAnimation();
      setCurrentUnitPosition(null);
    }
    
    return () => {
      stopAnimation();
    };
  }, [isSimulating, simulationMode, startPlayByPlayAnimation, stopAnimation]);
  
  return {
    currentUnitPosition,
    startPlayByPlaySimulation: startPlayByPlayAnimation
  };
};
