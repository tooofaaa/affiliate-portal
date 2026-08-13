// Demo mode: enabled only when NEXT_PUBLIC_DEMO_MODE=true AND not in production
// To disable entirely: set NEXT_PUBLIC_DEMO_MODE=false
export const DEMO_MODE =
  process.env.NEXT_PUBLIC_DEMO_MODE === 'true' &&
  process.env.NODE_ENV !== 'production';
