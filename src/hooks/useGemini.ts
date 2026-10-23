import { useState, useRef, useEffect, useCallback } from 'react';
import { WizardInputData } from '../schemas/eventSchema';
import { FullEventPlan, EventDetails, EventIdeas, BudgetCategory } from '../types/event';
import { generatePlanFromGemini, regenerateIdeasFromGemini, getVendorQuestionsFromGemini } from '../services/geminiService';

export function useGemini() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup in-flight requests on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const createAbortController = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    return abortControllerRef.current;
  };

  const generatePlan = useCallback(async (input: WizardInputData): Promise<FullEventPlan | null> => {
    setIsLoading(true);
    setLoadingMessage('Architecting budget breakdown and backward timeline...');
    setError(null);

    const controller = createAbortController();

    try {
      const plan = await generatePlanFromGemini(input, controller.signal);
      setIsLoading(false);
      setLoadingMessage('');
      return plan;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setIsLoading(false);
        return null;
      }
      const message = err instanceof Error ? err.message : 'Failed to generate plan';
      setError(message);
      setIsLoading(false);
      return null;
    }
  }, []);

  const regenerateIdeas = useCallback(
    async (eventDetails: EventDetails, userPrompt?: string): Promise<EventIdeas | null> => {
      setIsLoading(true);
      setLoadingMessage('Crafting fresh themes, decor, and signature menus...');
      setError(null);

      const controller = createAbortController();

      try {
        const ideas = await regenerateIdeasFromGemini(eventDetails, userPrompt, controller.signal);
        setIsLoading(false);
        setLoadingMessage('');
        return ideas;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          setIsLoading(false);
          return null;
        }
        setError(err instanceof Error ? err.message : 'Failed to refresh ideas');
        setIsLoading(false);
        return null;
      }
    },
    []
  );

  const fetchVendorQuestions = useCallback(
    async (category: BudgetCategory, eventType: string, guestCount: number, city: string): Promise<string[]> => {
      const controller = createAbortController();
      try {
        return await getVendorQuestionsFromGemini(category, eventType, guestCount, city, controller.signal);
      } catch (err) {
        return [];
      }
    },
    []
  );

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, []);

  return {
    isLoading,
    loadingMessage,
    error,
    clearError: () => setError(null),
    generatePlan,
    regenerateIdeas,
    fetchVendorQuestions,
    abort,
  };
}
