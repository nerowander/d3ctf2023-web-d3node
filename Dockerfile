FROM debian:buster-slim as builder
ADD readflag.c /readflag.c
RUN apt update && apt install -y gcc \
    && gcc /readflag.c -o /readflag

FROM node:19.9.0-buster-slim

COPY --from=builder /readflag /readflag

WORKDIR /usr/src/app

ADD ./app/ ./

RUN npm config set registry http://mirrors.cloud.tencent.com/npm/ \
    && npm install \
    && echo antd3ctf{MonG0_noSql_F1le_rEad_tr1cK!ThEn?npM_c0mmAnd!} > /flag \
    && chmod 0400 /flag && chown root:root /flag && chmod 4555 /readflag \
    && useradd d3ctf2023 && mkdir /home/d3ctf2023 && chown d3ctf2023 /home/d3ctf2023 \
    && mkdir /usr/src/app/public/tmp && chmod -R 0777 /usr/src/app/public

USER d3ctf2023
ENV DBUser d3ctf2023350j2tsykyydglx8
ENV DBPassword d3ctf2023aw2obp8tincqw6od

EXPOSE 8080
ENTRYPOINT ["node","./app.js"]