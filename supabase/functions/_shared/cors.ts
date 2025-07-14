
// export const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
//   'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
// };

const allowedOrigins = [
  "https://enkardia-dashboard-prod.vercel.app",
  "http://localhost:8080"
];

export const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : "",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
});

// export const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Headers': 'x-client-info, apikey, content-type, Content-Type, Authorization',
//   'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
// };
