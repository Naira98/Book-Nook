import re
import json


def extract_and_parse_json(text_with_markdown):
    match = re.search(r"```json\s*(.*?)\s*```", text_with_markdown, re.DOTALL)

    if not match:
        print("Error: No JSON string found within markdown fences.")
        return None

    json_string = match.group(1)

    # Clean up any potential leading/trailing whitespace
    json_string = json_string.strip()

    try:
        python_list = json.loads(json_string)
        return python_list
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        return None
