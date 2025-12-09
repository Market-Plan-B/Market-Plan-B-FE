# 프로젝트 설치 가이드

## 필수 패키지 설치

```bash
# 프로덕션 의존성
npm install maplibre-gl d3 lottie-web vuedraggable

# 개발 의존성
npm install -D tailwindcss postcss autoprefixer
```

또는 한 번에 설치:

```bash
npm install
```

## 사용 중인 패키지

- **maplibre-gl**: WorldOilMap.vue에서 지도 표시
- **d3**: ChartBar.vue에서 차트 그리기
- **lottie-web**: DashboardView.vue, CrawlingSourceView.vue에서 애니메이션
- **vuedraggable**: CrawlingSourceView.vue에서 드래그 앤 드롭

## 개발 서버 실행

```bash
npm run dev
```

## 빌드

```bash
npm run build
```
