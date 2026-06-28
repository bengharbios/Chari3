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
