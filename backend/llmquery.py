from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from openai import OpenAI
import uvicorn
import requests
import time

app = FastAPI()


class UserInput(BaseModel):
    user_message: str

@app.post("/generate-completion")
async def generate_completion(user_input: UserInput):
    try:
        openai_url = "https://api.openai.com/v1/chat/completions"
        openai_headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer --insert OpenAI API key--"  #OpenAI API key
        }
        start_time = time.time()
        openai_payload = {
            "model": "gpt-3.5-turbo", #gpt model being used, "gpt-3.5-turbo" or  "gpt-4"
            "messages": [
                {"role": "system", "content": 
                """You are an assistant that fact checks non-subjective sentences. I will give you a set of sentences. You will identify sentences that are 
                non-subjective, do not vary with individuals and are NOT based on personal experiences. You will then go ahead and create only a JSON for each of
                the non-subjective sentences where each of those JSONs will have the following fields:
                Claim - the sentence being verified
                T/F - whether the claim is True or False
                Score - a confidence score in the range of 0-1
                Explanation - a step-by-step explanation of why the claim is reported to be true or false"""},
                {"role": "user", "content": user_input.user_message}
            ]
        }

        response = requests.post(openai_url, headers=openai_headers, json=openai_payload)
        response.raise_for_status()

        end_time = time.time()
        latency = (end_time - start_time)*1000
        print(latency) #total latency to compare models

        # Extract relevant information from the OpenAI response
        openai_response = response.json()
        response_text = openai_response['choices'][0]['message']['content']

        # Create a JSON response
        result = {
            "user_input": user_input.user_message,
            "openai_response": response_text,
        }


        return JSONResponse(content=result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating completion: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("llmquery:app", host="127.0.0.1", port=8000, reload=True)