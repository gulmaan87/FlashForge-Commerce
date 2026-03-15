export function getEnv(name: string, fallback?: string): string {
     const value = process.env[name] ?? fallback;
      if (!value) {
         throw new Error(`Missing required environment variable: ${name}`); 
        }
    return value;
}