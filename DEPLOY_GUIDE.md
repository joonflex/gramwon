# Gramwon 다중 앱 배포 가이드

## 📋 프로젝트 구조

```
gramwon/
├── main-app/              → gramwon.me (메인 홈페이지)
├── password-app/          → gramwon.me/password (비밀번호 관리)
├── docker-compose.yml     → 모든 앱 관리
├── nginx-gramwon.conf     → Nginx 설정 파일
└── DEPLOY_GUIDE.md        → 이 문서
```

---

## 🚀 새 서버에 배포하기

### 서버 정보
- IP: 1.226.82.225
- 도메인: gramwon.me
- OS: Ubuntu

---

### 1단계: 서버 접속 및 기본 설정

```bash
# 서버 접속
ssh root@1.226.82.225

# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 필수 패키지 설치
sudo apt install -y curl git nano
```

---

### 2단계: Docker 설치

```bash
# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker 서비스 시작
sudo systemctl start docker
sudo systemctl enable docker

# Docker Compose 설치
sudo apt install -y docker-compose

# 설치 확인
docker --version
docker-compose --version
```

---

### 3단계: GitHub에서 프로젝트 클론

```bash
# 홈 디렉토리로 이동
cd ~

# 기존 프로젝트가 있다면 백업
if [ -d ~/gramwon ]; then
    mv ~/gramwon ~/gramwon_backup_$(date +%Y%m%d_%H%M%S)
fi

# GitHub에서 클론
git clone <YOUR_GITHUB_URL> gramwon

# 프로젝트 디렉토리로 이동
cd gramwon
```

---

### 4단계: 환경변수 설정

```bash
# password-app 환경변수 설정
cd ~/gramwon/password-app
nano .env
```

**`.env` 파일 내용:**
```bash
AUTH_ID=gram
AUTH_PASSWORD=3535
SESSION_SECRET=your-random-secret-here
GOOGLE_SHEET_ID=1B-To8hwa2mWOByQR0eLifNMAd-3OaqhOHZtWKScUJsE
```

**SESSION_SECRET 자동 생성:**
```bash
cd ~/gramwon/password-app
echo "SESSION_SECRET=$(openssl rand -base64 32)" >> .env
```

---

### 5단계: Docker로 모든 앱 실행

```bash
# 루트 디렉토리로 이동
cd ~/gramwon

# Docker Compose로 모든 앱 빌드 및 실행 (5-10분 소요)
docker-compose up -d --build

# 실행 확인
docker-compose ps
docker-compose logs -f
```

**정상 실행 확인:**
```
NAME               STATUS         PORTS
gramwon-main       Up 30 seconds  0.0.0.0:3000->3000/tcp
gramwon-password   Up 30 seconds  0.0.0.0:3001->3000/tcp
```

`Ctrl + C`로 로그 종료

---

### 6단계: 접속 테스트

```bash
# 메인 앱 테스트
curl http://localhost:3000

# Password 앱 테스트
curl http://localhost:3001/password

# 외부 브라우저 테스트
# http://1.226.82.225:3000
# http://1.226.82.225:3001/password
```

---

### 7단계: Nginx 설치 및 설정

```bash
# Nginx 설치
sudo apt install -y nginx

# Nginx 설정 파일 복사
sudo cp ~/gramwon/nginx-gramwon.conf /etc/nginx/sites-available/gramwon

# 기존 default 설정 비활성화
sudo rm -f /etc/nginx/sites-enabled/default

# 새 설정 활성화
sudo ln -s /etc/nginx/sites-available/gramwon /etc/nginx/sites-enabled/

# 설정 문법 검사
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx

# Nginx 상태 확인
sudo systemctl status nginx
```

---

### 8단계: 방화벽 설정

```bash
# UFW 방화벽 설정
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
sudo ufw status
```

---

### 9단계: 도메인 접속 테스트

```bash
# 서버에서 테스트
curl http://gramwon.me
curl http://gramwon.me/password

# 브라우저에서 접속
# http://gramwon.me
# http://gramwon.me/password
```

---

### 10단계: SSL 인증서 설치 (HTTPS)

```bash
# Certbot 설치
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# SSL 인증서 발급 및 자동 설정
sudo certbot --nginx -d gramwon.me -d www.gramwon.me
```

**Certbot 질문 답변:**
1. 이메일 입력: (알림받을 이메일)
2. 약관 동의: `Y`
3. 뉴스레터: `N`
4. Redirect: `2` (HTTP → HTTPS 자동 리다이렉트)

```bash
# 자동 갱신 테스트
sudo certbot renew --dry-run
```

---

### 11단계: 최종 접속 확인

```
https://gramwon.me           → 메인 홈페이지
https://gramwon.me/password  → 비밀번호 관리 (로그인 필요)
```

**로그인 정보:**
- ID: `gram`
- PW: `3535`

---

## 🔧 관리 명령어

### Docker 관리

```bash
# 모든 앱 상태 확인
docker-compose ps

# 모든 앱 로그 확인
docker-compose logs -f

# 특정 앱 로그만 확인
docker-compose logs -f main
docker-compose logs -f password

# 특정 앱만 재시작
docker-compose restart main
docker-compose restart password

# 모든 앱 재시작
docker-compose restart

# 모든 앱 중지
docker-compose stop

# 모든 앱 시작
docker-compose start

# 모든 앱 중지 및 삭제
docker-compose down
```

### Nginx 관리

```bash
# Nginx 재시작
sudo systemctl restart nginx

# Nginx 재로드 (설정 변경 시)
sudo systemctl reload nginx

# Nginx 상태 확인
sudo systemctl status nginx

# 로그 확인
sudo tail -f /var/log/nginx/gramwon-access.log
sudo tail -f /var/log/nginx/gramwon-error.log
```

---

## 🆕 새 앱 추가하기

### 예시: admin 앱 추가 (`gramwon.me/admin`)

#### 1. 새 앱 폴더 생성

```bash
cd ~/gramwon
mkdir admin-app
cd admin-app

# Next.js 프로젝트 생성 또는 기존 프로젝트 복사
```

#### 2. next.config.js 수정

```javascript
const nextConfig = {
  basePath: '/admin',
  output: 'standalone',
}

module.exports = nextConfig
```

#### 3. Dockerfile 추가

기존 앱의 Dockerfile을 복사:
```bash
cp ~/gramwon/password-app/Dockerfile ~/gramwon/admin-app/
```

#### 4. docker-compose.yml에 추가

```yaml
  admin:
    build:
      context: ./admin-app
      dockerfile: Dockerfile
    container_name: gramwon-admin
    restart: unless-stopped
    ports:
      - "3002:3000"
    environment:
      - NODE_ENV=production
```

#### 5. Nginx 설정 업데이트

```bash
sudo nano /etc/nginx/sites-available/gramwon
```

추가할 내용:
```nginx
    # Admin 앱 (/admin)
    location /admin/ {
        proxy_pass http://localhost:3002/admin/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
```

#### 6. 재시작

```bash
# Docker 컨테이너 시작
cd ~/gramwon
docker-compose up -d --build admin

# Nginx 재로드
sudo systemctl reload nginx
```

#### 7. 접속 확인

```
https://gramwon.me/admin
```

---

## 🔄 코드 업데이트 및 재배포

```bash
# 1. 서버 접속
ssh root@1.226.82.225

# 2. 프로젝트 디렉토리로 이동
cd ~/gramwon

# 3. 최신 코드 가져오기
git pull origin main

# 4. 모든 앱 재빌드 및 재시작
docker-compose down
docker-compose up -d --build

# 5. 로그 확인
docker-compose logs -f
```

**특정 앱만 업데이트:**
```bash
# password 앱만 재빌드
docker-compose up -d --build password

# main 앱만 재빌드
docker-compose up -d --build main
```

---

## 🆘 문제 해결

### 문제 1: 포트 충돌

```bash
# 포트 사용 확인
sudo lsof -i :3000
sudo lsof -i :3001

# 프로세스 종료
sudo kill -9 <PID>
```

### 문제 2: Docker 컨테이너 실행 실패

```bash
# 로그 확인
docker-compose logs password
docker-compose logs main

# 컨테이너 재시작
docker-compose restart password
```

### 문제 3: Nginx 502 Bad Gateway

```bash
# 1. Docker 컨테이너 상태 확인
docker-compose ps

# 2. 컨테이너 재시작
docker-compose restart

# 3. Nginx 로그 확인
sudo tail -f /var/log/nginx/gramwon-error.log

# 4. Nginx 재시작
sudo systemctl restart nginx
```

### 문제 4: SSL 인증서 오류

```bash
# 인증서 갱신
sudo certbot renew

# Nginx 재시작
sudo systemctl restart nginx
```

---

## 📊 현재 앱 목록

| 앱 이름 | URL | 포트 | 설명 |
|--------|-----|------|------|
| main | gramwon.me | 3000 | 메인 홈페이지 |
| password | gramwon.me/password | 3001 | 비밀번호 관리 시스템 |

---

## ✅ 배포 완료 체크리스트

- [ ] Docker 및 Docker Compose 설치
- [ ] 프로젝트 클론
- [ ] 환경변수 설정 (.env)
- [ ] Docker 컨테이너 실행
- [ ] `docker-compose ps` 모든 앱 Up 상태
- [ ] Nginx 설치 및 설정
- [ ] `sudo nginx -t` 문법 검사 통과
- [ ] 방화벽 설정 (80, 443 포트 오픈)
- [ ] 도메인 접속 확인
- [ ] SSL 인증서 설치
- [ ] HTTPS 접속 확인
- [ ] 모든 앱 정상 작동 확인

---

## 🎉 배포 완료!

이제 `gramwon.me`에서 여러 서비스를 한 곳에서 관리할 수 있습니다!

**메인 페이지:** https://gramwon.me
**Password Manager:** https://gramwon.me/password

추가 앱을 계속해서 확장할 수 있습니다.
