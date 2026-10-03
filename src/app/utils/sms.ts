import httpStatus from 'http-status';
import config from '../config';
import ApiError from '../errors/ApiError';

// Bangladesh mobile numbers in the gateway's format: 8801XXXXXXXXX.
// Accepts 01XXXXXXXXX, 1XXXXXXXXX, 8801XXXXXXXXX and +8801XXXXXXXXX (spaces/dashes ignored).
export const normalizeBdPhone = (input: string): string | null => {
  const digits = input.replace(/\D/g, '');
  let n = digits;
  if (n.startsWith('880')) n = n.slice(3);
  else if (n.startsWith('0')) n = n.slice(1);
  return /^1[3-9]\d{8}$/.test(n) ? `880${n}` : null;
};

/** Sends a transactional SMS through MiMSMS. `to` must already be normalized (8801XXXXXXXXX). */
export const sendSms = async (to: string, message: string): Promise<void> => {
  const { api_url, api_key, user_name, sender_id, transaction_type } = config.sms;
  if (!api_key || !user_name || !sender_id) {
    throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'SMS service is not configured');
  }

  let res: Response;
  try {
    res = await fetch(api_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: api_key,
        userName: user_name,
        senderName: sender_id,
        transactionType: transaction_type,
        mobileNumber: to,
        message,
      }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    console.error('[sms] request failed:', (err as Error).message);
    throw new ApiError(httpStatus.BAD_GATEWAY, 'Could not send SMS. Please try again.');
  }

  // MiMSMS answers { statusCode: "200", status: "Success", trxnId, responseResult } on success
  const body = (await res.json().catch(() => null)) as { statusCode?: string | number; status?: string; responseResult?: string } | null;
  if (!res.ok || !body || String(body.statusCode) !== '200') {
    console.error('[sms] gateway rejected message:', res.status, JSON.stringify(body));
    throw new ApiError(httpStatus.BAD_GATEWAY, 'Could not send SMS. Please try again.');
  }
};
