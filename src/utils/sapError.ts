import { isAxiosError } from 'axios'

interface SapErrorBody {
  error?: {
    message?: string | { value?: string }
    innererror?: { errordetails?: Array<{ message?: string }> }
  }
}

export function sapGatewayMessage(error: unknown): string | undefined {
  if (!isAxiosError<SapErrorBody>(error)) return undefined
  const serverError = error.response?.data?.error
  const detail = serverError?.innererror?.errordetails?.find((item) => item.message)?.message
  if (detail) return detail
  const gatewayMessage = serverError?.message
  return typeof gatewayMessage === 'string' ? gatewayMessage : gatewayMessage?.value
}
