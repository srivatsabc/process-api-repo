FROM python:3.6
VOLUME /app
COPY . /app
WORKDIR /app
RUN pip3 install -r requirements.txt
EXPOSE 8085
ENTRYPOINT ["python3"]
CMD ["app.py"]
