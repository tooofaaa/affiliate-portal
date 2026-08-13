// Controlled entirely by env var — do not set in production deployments
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
