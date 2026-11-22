import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { unwrapODataResponse } from '@/utils/apiUtils'

/**
 * API Client for SAP OData services.
 * Handles base URL configuration, CSRF token management, and error handling.
 */

// TODO: replace YOUR_SERVICE_SRV with the real OData service name
const baseURL = '/sap/opu/odata/ATAL/YOUR_SERVICE_SRV/'

const CSRF_TOKEN_TTL_MS = 25 * 60 * 1000
const MODIFYING_METHODS = ['POST', 'PUT', 'PATCH', 'MERGE', 'DELETE']

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

let csrfToken: string | null = null
let csrfTokenExpiry: number | null = null

const clearCsrfToken = () => {
  csrfToken = null
  csrfTokenExpiry = null
}

const getCsrfToken = async (): Promise<string> => {
  if (csrfToken && csrfTokenExpiry && Date.now() < csrfTokenExpiry) {
    return csrfToken
  }

  const response = await axios.get(baseURL, {
    headers: {
      'x-csrf-token': 'Fetch',
      Accept: 'application/json'
    }
  })

  const token = response.headers['x-csrf-token'] as string | undefined
  if (!token) {
    throw new Error('Failed to obtain CSRF token from SAP OData service')
  }

  csrfToken = token
  csrfTokenExpiry = Date.now() + CSRF_TOKEN_TTL_MS
  return token
}

apiClient.interceptors.request.use(async (config) => {
  if (MODIFYING_METHODS.includes(config.method?.toUpperCase() ?? '')) {
    try {
      config.headers['x-csrf-token'] = await getCsrfToken()
    } catch (error) {
      // Don't fail the request, let the server respond with a CSRF error if needed
      console.error('Failed to add CSRF token to request', error)
    }
  }
  return config
})

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Only unwrap JSON bodies; leave $count / $value / $metadata / 204 responses untouched
    if (response.data && typeof response.data === 'object') {
      response.data = unwrapODataResponse<any>(response.data)
    }
    return response
  },
  async (error: AxiosError) => {
    const config = error.config as (InternalAxiosRequestConfig & { _csrfRetried?: boolean }) | undefined
    const csrfRequired =
      String(error.response?.headers?.['x-csrf-token'] ?? '').toLowerCase() === 'required'

    // SAP rejects an expired/invalid CSRF token with 403 + "x-csrf-token: Required" - refresh and retry once
    if (error.response?.status === 403 && csrfRequired && config && !config._csrfRetried) {
      clearCsrfToken()
      config._csrfRetried = true
      return apiClient(config)
    }

    console.error('API Error:', error.response?.status, error.response?.data)
    return Promise.reject(error)
  }
)

export default apiClient
