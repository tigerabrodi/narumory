import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExtractAsyncFnArgs<Args extends Array<any>> =
  Args extends Array<infer PotentialArgTypes> ? [PotentialArgTypes] : []


type Result<ReturnType> = [ReturnType, null] | [null, Error]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function runAsync<Args extends Array<any>, ReturnType>(
  asyncFn: (
    ...args: ExtractAsyncFnArgs<Args>
  ) => Promise<ReturnType>,
  ...args: ExtractAsyncFnArgs<Args>
): Promise<Result<ReturnType>> {
  try {
    const result = await asyncFn(...args)
    return [result, null]
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))]
  }
}
