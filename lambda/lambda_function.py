import json
import os
import requests

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

GEMINI_MODEL = "gemini-2.5-flash"
GEMINI_ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

GROQ_MODEL = "llama-3.3-70b-versatile"
GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Content-Type": "application/json",
}


def call_gemini(prompt: str) -> str:
    """Call Google Gemini and return the text response."""
    print(f"[Gemini] Sending prompt (length={len(prompt)})")
    payload = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ]
    }
    response = requests.post(
        GEMINI_ENDPOINT,
        params={"key": GEMINI_API_KEY},
        headers={"Content-Type": "application/json"},
        json=payload,
        timeout=30,
    )
    response.raise_for_status()
    data = response.json()
    text = data["candidates"][0]["content"]["parts"][0]["text"]
    print(f"[Gemini] Response received (length={len(text)})")
    return text


def call_groq(prompt: str) -> str:
    """Call Groq and return the text response."""
    print(f"[Groq] Sending prompt (length={len(prompt)})")
    payload = {
        "model": GROQ_MODEL,
        "messages": [{"role": "user", "content": prompt}],
    }
    response = requests.post(
        GROQ_ENDPOINT,
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=30,
    )
    response.raise_for_status()
    data = response.json()
    text = data["choices"][0]["message"]["content"]
    print(f"[Groq] Response received (length={len(text)})")
    return text


def lambda_handler(event, context):
    print(f"[Handler] Event method: {event.get('requestContext', {}).get('http', {}).get('method', 'UNKNOWN')}")

    # Handle CORS preflight
    http_method = (
        event.get("requestContext", {}).get("http", {}).get("method")
        or event.get("httpMethod")
        or "POST"
    )
    if http_method == "OPTIONS":
        print("[Handler] OPTIONS preflight — returning 200")
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    # Parse body
    try:
        body = json.loads(event.get("body") or "{}")
        prompt = body.get("prompt", "").strip()
        if not prompt:
            print("[Handler] Empty prompt received")
            return {
                "statusCode": 400,
                "headers": CORS_HEADERS,
                "body": json.dumps({"error": "Missing or empty 'prompt' field"}),
            }
    except json.JSONDecodeError as e:
        print(f"[Handler] JSON parse error: {e}")
        return {
            "statusCode": 400,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": "Invalid JSON body"}),
        }

    # Try Gemini first
    try:
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY environment variable is not set")
        response_text = call_gemini(prompt)
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"response": response_text, "provider": "gemini"}),
        }
    except Exception as gemini_error:
        print(f"[Gemini] Failed: {gemini_error} — falling back to Groq")

    # Fallback: Groq
    try:
        if not GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY environment variable is not set")
        response_text = call_groq(prompt)
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"response": response_text, "provider": "groq"}),
        }
    except Exception as groq_error:
        print(f"[Groq] Failed: {groq_error}")
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": f"Both providers failed. Groq error: {str(groq_error)}"}),
        }
