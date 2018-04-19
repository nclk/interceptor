#FROM pritunl/archlinux:latest
FROM archlinux/base

WORKDIR /interceptor

RUN pacman -Syyu \
  nodejs \
  npm \
  --noconfirm

ADD . /interceptor
RUN npm install

CMD ["node","app.js"]
