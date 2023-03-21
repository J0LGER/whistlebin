#!/bin/bash
docker rm -f whistlebin
docker build --no-cache --tag=whistlebin .
docker run -p 1337:1337 -it --name=whistlebin whistlebin
