import { z } from "zod";

export type ActionErrorCode =
  | "VALIDATION"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "CONCURRENCY"
  | "PROVIDER"
  | "INTERNAL";

export class ActionError extends Error {
  readonly code: ActionErrorCode;

  constructor(code: ActionErrorCode, message: string) {
    super(message);
    this.name = "ActionError";
    this.code = code;
  }
}

function getDatabaseCode(error: unknown) {
  if (typeof error !== "object" || error === null) return undefined;
  const candidate = error as { code?: unknown; cause?: { code?: unknown } };
  return candidate.code ?? candidate.cause?.code;
}

function isUniqueViolation(error: unknown) {
  return getDatabaseCode(error) === "23505";
}

function isExclusionViolation(error: unknown) {
  return getDatabaseCode(error) === "23P01";
}

export async function runSafeAction<T>(
  context: string,
  action: () => Promise<T>,
  fallbackMessage: string,
) {
  try {
    return await action();
  } catch (error) {
    if (error instanceof ActionError) throw error;

    if (error instanceof z.ZodError) {
      throw new ActionError("VALIDATION", error.issues[0]?.message ?? "The submitted data is invalid.");
    }

    if (isUniqueViolation(error)) {
      console.error(`[${context}] database conflict`, error);
      throw new ActionError("CONFLICT", "This record conflicts with existing hotel data.");
    }

    if (isExclusionViolation(error)) {
      console.error(`[${context}] inventory concurrency conflict`, error);
      throw new ActionError("CONCURRENCY", "The selected room is no longer available for those dates.");
    }

    console.error(`[${context}] unexpected failure`, error);
    throw new ActionError("INTERNAL", fallbackMessage);
  }
}
