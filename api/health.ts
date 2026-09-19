// Vercel Serverless Function: GET /api/health
//
// Visit https://<your-domain>/api/health after deploying to confirm the
// Azure Translator key is actually visible to the serverless function.
// Does not expose the key itself - only whether it's present, and which
// region is configured.

type VercelRequest = { method?: string };
type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: any) => void;
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    status: 'ok',
    hasAzureKey: Boolean(process.env.AZURE_TRANSLATOR_KEY),
    region: process.env.AZURE_TRANSLATOR_REGION || 'global',
  });
}
