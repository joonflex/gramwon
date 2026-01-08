# Gramwon - 다중 앱 관리 플랫폼

여러 Next.js 애플리케이션을 하나의 도메인에서 관리하는 플랫폼

## 📁 프로젝트 구조

```
gramwon/
├── main-app/              # 메인 홈페이지 (gramwon.me)
├── password-app/          # 비밀번호 관리 (gramwon.me/password)
├── docker-compose.yml     # 모든 앱 관리
├── nginx-gramwon.conf     # Nginx 설정
└── DEPLOY_GUIDE.md        # 배포 가이드
```

## 🚀 빠른 시작 (로컬 개발)

### 1. 프로젝트 클론

```bash
git clone <YOUR_GITHUB_URL> gramwon
cd gramwon
```

### 2. 환경변수 설정

```bash
cd password-app
cp .env.example .env
# .env 파일 수정
```

### 3. Docker로 실행

```bash
cd ..
docker-compose up -d --build
```

### 4. 접속

- 메인: http://localhost:3000
- Password: http://localhost:3001/password

## 🌐 프로덕션 배포

자세한 배포 가이드는 [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)를 참고하세요.

### 간단 요약

```bash
# 1. 서버 접속
ssh root@1.226.82.225

# 2. Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install -y docker-compose

# 3. 프로젝트 클론
git clone <YOUR_GITHUB_URL> gramwon
cd gramwon

# 4. 환경변수 설정
cd password-app
nano .env
cd ..

# 5. 실행
docker-compose up -d --build

# 6. Nginx 설정
sudo apt install -y nginx
sudo cp nginx-gramwon.conf /etc/nginx/sites-available/gramwon
sudo ln -s /etc/nginx/sites-available/gramwon /etc/nginx/sites-enabled/
sudo systemctl restart nginx

# 7. SSL 설치
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d gramwon.me -d www.gramwon.me
```

## 📦 현재 앱 목록

| 앱 | URL | 포트 | 설명 |
|---|-----|------|------|
| **Main** | `gramwon.me` | 3000 | 메인 홈페이지 |
| **Password** | `gramwon.me/password` | 3001 | 비밀번호 관리 시스템 |

## ➕ 새 앱 추가하기

### 1. 새 폴더 생성

```bash
mkdir your-app
cd your-app
```

### 2. next.config.js 설정

```javascript
const nextConfig = {
  basePath: '/your-app',
  output: 'standalone',
}
```

### 3. docker-compose.yml에 추가

```yaml
  your-app:
    build: ./your-app
    container_name: gramwon-your-app
    ports:
      - "3002:3000"
```

### 4. nginx-gramwon.conf에 추가

```nginx
location /your-app/ {
    proxy_pass http://localhost:3002/your-app/;
    # ... 기타 설정
}
```

### 5. 재시작

```bash
docker-compose up -d --build your-app
sudo systemctl reload nginx
```

## 🔧 관리 명령어

### Docker

```bash
# 모든 앱 시작
docker-compose up -d

# 특정 앱 재시작
docker-compose restart password

# 로그 확인
docker-compose logs -f

# 중지
docker-compose down
```

### Nginx

```bash
# 재시작
sudo systemctl restart nginx

# 로그 확인
sudo tail -f /var/log/nginx/gramwon-access.log
```

## 🛠 기술 스택

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Container**: Docker & Docker Compose
- **Web Server**: Nginx
- **SSL**: Let's Encrypt (Certbot)

## 📝 환경변수

### password-app

```bash
AUTH_ID=gram
AUTH_PASSWORD=3535
SESSION_SECRET=<random-secret>
GOOGLE_SHEET_ID=<sheet-id>
```

## 🔐 보안

- 모든 비밀번호는 환경변수로 관리
- HTTPS 강제 적용 (Let's Encrypt)
- Docker 컨테이너 격리
- Nginx 리버스 프록시

## 📄 라이선스

MIT

## 👤 작성자

Gramwon Team

## 🤝 기여

Pull Request는 언제나 환영합니다!
