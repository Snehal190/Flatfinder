import type { PersonAnswers } from "@/lib/schema";

export interface StepProps {
  answers: PersonAnswers;
  set: (patch: Partial<PersonAnswers>) => void;
}

export const STEPS = ["Money", "Where", "The flat", "Lifestyle", "Review"] as const;
