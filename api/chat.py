import os
import json

API_KEY = os.getenv("YOU_API_KEY")
YOU_API_URL = "https://api.you.com/v1/agents/runs"

max_words = 10
tones = ["Funny", "Serious", "Aggressive", "Academic", "Sarcastic", "Calm"]

def handler(request):
    if request.method != "POST":
        return {
            "statusCode": 405,
            "body": json.dumps({"error": "Method Not Allowed"})
        }

    try:
        body = json.loads(request.body.decode("utf-8"))
        question = body.get("question")
        guest_a = body.get("guest_a")
        guest_b = body.get("guest_b")
        tone = body.get("tone")

        if not question or not guest_a or not guest_b or not tone:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Missing required fields"})
            }

        if tone not in tones:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Invalid tone"})
            }

        prompt = (
            "Task:Create a fictional parody dialogue. \n"
            f"Question:{question}\n\n"
            "Instructions:\n"
            f"- Each response under {max_words} words.\n"
            "- Exaggerated parody versions.\n"
            f"- Tone: {tone}\n\n"
            f"{guest_a} should respond.\n"
            f"{guest_b} should reply.\n"
        )

        # RETURN A **SINGLE LINE STRING**
        answer = "Elon Musk: Mars time! Donald Trump: Huge Mars deals!"

        reply = {
            "received_question": question,
            "guest_a": guest_a,
            "guest_b": guest_b,
            "tone": tone,
            "prompt_sent": prompt,
            "llm_answer": answer
        }

        return {
            "statusCode": 200,
            "body": json.dumps({"output": reply})
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "Server crashed", "details": str(e)})
        }
