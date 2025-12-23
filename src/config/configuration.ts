export default () => ({
  port: parseInt(process.env.PORT ?? '3001'),
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  openaiKey: process.env.OPENAI_API_KEY,
});
