const SECRET_KEYS = ['GEMINI_API_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];

function redact(value) {
  let text = String(value);
  for (const key of SECRET_KEYS) {
    const secret = process.env[key];
    if (secret) text = text.split(secret).join('[REDACTED]');
  }
  return text;
}

export function logServerError(context, error) {
  if (error instanceof Error) {
    console.error(context, {
      name: redact(error.name),
      message: redact(error.message),
      code: error.code ? redact(error.code) : undefined,
      status: error.status ?? error.statusCode,
    });
    return;
  }

  if (error && typeof error === 'object') {
    console.error(context, {
      code: error.code ? redact(error.code) : undefined,
      message: error.message ? redact(error.message) : 'Unknown server error.',
      details: error.details ? redact(error.details) : undefined,
      hint: error.hint ? redact(error.hint) : undefined,
    });
    return;
  }

  console.error(context, redact(error ?? 'Unknown server error.'));
}
