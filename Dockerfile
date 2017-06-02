#FROM pritunl/archlinux:latest
FROM base/archlinux

WORKDIR /interceptor

RUN pacman -Syyu \
  nodejs \
  npm \
  --noconfirm

ADD . /interceptor
RUN npm install

CMD ["node","app.js"]
