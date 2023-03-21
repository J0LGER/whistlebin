FROM python:3.8-slim-buster

RUN apt -y update && apt -y install build-essential
RUN pip install "fastapi[all]" && pip install "uvicorn[standard]" && pip install pyminizip

COPY app /app 
WORKDIR /app 

ENV PORT=1337 

ENTRYPOINT ["uvicorn", "index:app","--host", "0.0.0.0", "--port", "1337"] 
EXPOSE $PORT