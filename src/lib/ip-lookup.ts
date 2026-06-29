export async function lookupIpLocation(ip: string): Promise<{ countryCode: string | null, city: string | null }> {
  // Ignore local / private IPs
  if (
    !ip || 
    ip === '::1' || 
    ip === '127.0.0.1' || 
    ip.startsWith('192.168.') || 
    ip.startsWith('10.') || 
    ip.startsWith('172.16.')
  ) {
    return { countryCode: null, city: null };
  }

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode,city`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(2000)
    });
    
    if (!res.ok) return { countryCode: null, city: null };
    
    const data = await res.json();
    return {
      countryCode: data.countryCode || null,
      city: data.city || null
    };
  } catch (e) {
    console.error('[lookupIpLocation] Failed to lookup IP:', ip, e);
    return { countryCode: null, city: null };
  }
}

export function parseUserAgent(ua: string | null | undefined) {
  let deviceType = 'Desktop';
  let os = 'Unknown OS';
  let browser = 'Unknown Browser';

  if (!ua) return { deviceType, os, browser };
  const lower = ua.toLowerCase();

  if (/mobile|android|iphone|ipad|phone/i.test(lower)) {
    deviceType = /ipad|tablet/i.test(lower) ? 'Tablet' : 'Mobile';
  }

  if (lower.includes('windows')) os = 'Windows';
  else if (lower.includes('macintosh') || lower.includes('mac os')) os = 'macOS';
  else if (lower.includes('iphone') || lower.includes('ipad')) os = 'iOS';
  else if (lower.includes('android')) os = 'Android';
  else if (lower.includes('linux')) os = 'Linux';

  if (lower.includes('firefox')) browser = 'Firefox';
  else if (lower.includes('opr/') || lower.includes('opera')) browser = 'Opera';
  else if (lower.includes('edg/')) browser = 'Edge';
  else if (lower.includes('chrome') && !lower.includes('chromium')) browser = 'Chrome';
  else if (lower.includes('safari') && !lower.includes('chrome')) browser = 'Safari';

  return { deviceType, os, browser };
}
