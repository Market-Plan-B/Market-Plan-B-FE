# 1단계: 빌드
FROM node:20-alpine AS build

WORKDIR /app

# 환경변수 설정
ARG VITE_MAPTILER_KEY
ARG VITE_TWELVEDATA_KEY
ENV VITE_MAPTILER_KEY=$VITE_MAPTILER_KEY
ENV VITE_TWELVEDATA_KEY=$VITE_TWELVEDATA_KEY

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 소스 코드 복사
COPY . .

# 빌드 실행
RUN npm run build

# 2단계: 배포용 Nginx
FROM nginx:1.27-alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
