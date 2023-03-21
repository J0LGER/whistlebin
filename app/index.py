from fastapi import FastAPI, Request, HTTPException, Response, Query, BackgroundTasks, UploadFile, File, Form
from pydantic import BaseModel
from modules.__init__ import Secret
from uuid import uuid4
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
import random
import string
import pyminizip
import os
import tempfile
import io
import base64


class SecretModel(BaseModel): 
    secret_message: str = Query(max_length=100, default="Empty secret")
    hours_ttl: int = Query(ge=0, le=72, allow_empty=True, depends_on=["secret_message"]) 
    minutes_ttl: int = Query(ge=1, le=60, allow_empty=True, depends_on=["secret_message"])

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="static")

secrets = dict() 
nocacheheader = {'Cache-Control': 'private, max-age=0, s-maxage=0 ,no-cache, no-store'} 

@app.get('/')
def index(request: Request): 
    return  templates.TemplateResponse('index.html',{'request': request, 'version': os.getenv('VERSION') })

@app.post('/api/v1/save/whistle') 
async def save_secret(secret: SecretModel, background_tasks: BackgroundTasks): 
        uuid = str(uuid4())
        secrets.update( 
            {
                uuid: Secret(secret.secret_message, secret.hours_ttl, secret.minutes_ttl, uuid)
            })
        background_tasks.add_task(secrets[uuid].startTimer, secrets) 
        return { "url" : "%s"%(uuid) }


#Add no cache control to avoid proxy caching
@app.get('/s/{uuid}', response_class=HTMLResponse)
def get_whistle(request: Request, uuid: str):
    try: 
        return templates.TemplateResponse('main.html',{'request': request, 'secret': secrets[uuid].getSecret() }, headers=nocacheheader)
    except: 
        return templates.TemplateResponse('main.html',{'request': request, 'secret': 'Looks like your secret has been expired!'}, headers=nocacheheader)


@app.get('/s/{uuid}/burn', response_class=HTMLResponse) 
def burn_whistle(request: Request, uuid: str):
    try: 
        del secrets[uuid] 
        return templates.TemplateResponse('main.html',{'request': request, 'secret': 'Secret Burned!' }, headers=nocacheheader)
    except: 
        return templates.TemplateResponse('main.html',{'request': request, 'secret': 'Looks like your secret has been expired!'}, headers=nocacheheader)

@app.post('/api/v1/save/file')
async def save_file(background_tasks: BackgroundTasks, file: UploadFile = File(description="File to be secured"), hours_ttl: int = Form(ge=0, le=72, default=0), minutes_ttl: int = Form(gt=0, le=60, default=5)): 
    
    # Generate a random password
    password = ''.join(random.choices(string.ascii_letters + string.digits, k=16))
    
    # Sanitize file name
    secure_uploaded_file_name = os.path.basename(file.filename)
    
    # Create a temporary directory to store the archive and the uploaded file
    with tempfile.TemporaryDirectory() as temp_dir:
        # Write the uploaded file to the temporary directory
        with open(os.path.join(temp_dir, secure_uploaded_file_name), 'wb') as uploaded_file:
            uploaded_file.write(file.file.read())
            
        # Set the input and output file names and the password
        input_file = os.path.join(temp_dir, secure_uploaded_file_name)
        output_zip = os.path.join(temp_dir, "secured_file.zip")
        
        # Set the compression level (1-9, with 9 being the highest)
        compression_level = 1
        
        # Zip the file with pyminizip
        pyminizip.compress(input_file, None, output_zip, password, compression_level)
        
        # Read the zip file into a buffer
        with open(output_zip, 'rb') as zip_file:
            zipbuffer = io.BytesIO(zip_file.read())

        # Generate Secret Link
        uuid = str(uuid4())
        secrets.update( 
            {
                uuid: Secret(password, hours_ttl, minutes_ttl, uuid)
            })
        background_tasks.add_task(secrets[uuid].startTimer, secrets) 
        
        # Return the zip file as a response with the appropriate headers
        return Response(base64.b64encode(zipbuffer.getvalue()),
                        headers = { 
                            "UUID": uuid,
                            "mime-type": "application/octet-stream",
                            "Content-Disposition": "attachment; filename=secured_file.zip"
                        }
        )
                

@app.get("/{path:path}")
async def catch_all(path: str):
    return Response(headers = {'Location' : '/' }, status_code=302)
