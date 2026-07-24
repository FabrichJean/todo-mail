// Client pour le service Notifier personnel (voir /Users/md/Documents/notifier/README.md).
// Best-effort : une notification manquée ne doit jamais faire échouer l'action réelle
// (inscription, envoi d'email) — toute erreur est avalée et loggée seulement.

const NOTIFIER_TIMEOUT_MS = 5000;

export async function sendNotification(params: {
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const serverUrl = process.env.NOTIFIER_SERVER_URL;
  const token = process.env.NOTIFIER_TOKEN;
  const deviceId = process.env.NOTIFIER_DEVICE_ID;
  if (!serverUrl || !token) return;

  try {
    const res = await fetch(`${serverUrl}/api/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": token },
      body: JSON.stringify({
        title: params.title,
        body: params.body,
        type: "notification",
        metadata: params.metadata,
        ...(typeof deviceId === "string" && deviceId.length > 0 ? { deviceId } : undefined),
      }),
      signal: AbortSignal.timeout(NOTIFIER_TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error(`Notifier: réponse ${res.status} lors de l'envoi de la notification`);
    }
  } catch (err) {
    console.error("Notifier: échec de l'envoi de la notification", err);
  }
}
