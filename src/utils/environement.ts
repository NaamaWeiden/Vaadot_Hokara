const host: string = window.location.hostname;

export const environment = 
    host.includes('gw.erp') || host.includes('gw.army') ? '' : host.includes('preprod') ? '.preprod' : '.qas'

/**
 * Determine if the current environment is production
 * based on the hostname.
 */
export function isProdEnvironment(): boolean {
  return host.includes('gw.erp') || host.includes('gw.army')
}