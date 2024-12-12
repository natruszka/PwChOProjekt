FROM python:3.12

COPY requirements.txt . 
RUN pip3 install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 50505

ENTRYPOINT ["gunicorn", "-c", "gunicorn.conf.py", "app:app"]