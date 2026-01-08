# 기존 서버에 배포하기

## 전제 조건
- Ubuntu 서버에 Next.js 프로그램이 설치되어 있음 (중지 상태)
- Nginx가 설치되어 있음
- Docker 및 Docker Compose가 설치되어 있음
- VS Code Remote-SSH로 서버 접속 가능

---

## 📋 배포 절차

### 1단계: 기존 Next.js 프로세스 완전 정리

```bash
# 서버 접속 후

# 1. 실행 중인 Node.js 프로세스 확인
ps aux | grep node

# 2. PM2 사용 중이면 모두 중지 및 삭제
pm2 list
pm2 stop all
pm2 delete all
pm2 kill

# 3. 포트 3000 사용 중인 프로세스 확인 및 종료
sudo lsof -i :3000
# PID 확인 후
sudo kill -9 <PID>

# 4. 기존 Next.js 프로젝트 백업 (혹시 모를 상황 대비)
cd ~
mv mygramwon mygramwon_backup_$(date +%Y%m%d_%H%M%S)
# 또는 기존 프로젝트가 다른 이름이라면
# mv <기존프로젝트명> <기존프로젝트명>_backup_$(date +%Y%m%d_%H%M%S)
```

---

### 2단계: 새 프로젝트 업로드

**방법 1: VS Code에서 파일 전송 (권장)**

1. VS Code에서 Remote-SSH로 서버 접속
2. 서버에서 새 폴더 생성:
   ```bash
   mkdir -p ~/mygramwon
   ```
3. VS Code 왼쪽 Explorer에서 로컬 `/Users/joonflex/Desktop/code` 폴더의 모든 파일 선택
4. 서버의 `~/mygramwon` 폴더로 드래그 앤 드롭

**방법 2: Git 사용**

```bash
cd ~
git clone <YOUR_REPO_URL> mygramwon
cd mygramwon
```

**방법 3: SCP로 전송 (터미널에서)**

로컬 맥북에서:
```bash
cd /Users/joonflex/Desktop/code
scp -r * user@server-ip:~/mygramwon/
```

---

### 3단계: 환경변수 설정

```bash
cd ~/mygramwon

# .env 파일 생성
nano .env
```

**`.env` 파일 내용:**
```bash
AUTH_ID=gram
AUTH_PASSWORD=3535
SESSION_SECRET=$(openssl rand -base64 32)
GOOGLE_SHEET_ID=1B-To8hwa2mWOByQR0eLifNMAd-3OaqhOHZtWKScUJsE
```

저장: `Ctrl + O` → `Enter` → `Ctrl + X`

---

### 4단계: Docker로 실행

```bash
cd ~/mygramwon

# Docker Compose로 빌드 및 실행
docker compose up -d --build

# 실행 확인
docker compose ps
docker compose logs -f
```

**정상 실행 확인:**
```
NAME          STATUS         PORTS
mygramwon     Up 30 seconds  0.0.0.0:3000->3000/tcp
```

---

### 5단계: Nginx 설정 (리버스 프록시)

#### 5-1. 기존 Nginx 설정 확인

```bash
# 기존 설정 파일 확인
ls /etc/nginx/sites-available/
ls /etc/nginx/sites-enabled/

# 기존 설정 내용 확인
cat /etc/nginx/sites-enabled/default
```

#### 5-2. 새 설정 파일 생성

```bash
sudo nano /etc/nginx/sites-available/mygramwon
```

**Nginx 설정 내용:**
```nginx
server {
    listen 80;
    server_name gramwon.me www.gramwon.me;

    # 로그 설정
    access_log /var/log/nginx/mygramwon-access.log;
    error_log /var/log/nginx/mygramwon-error.log;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 타임아웃 설정
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

저장: `Ctrl + O` → `Enter` → `Ctrl + X`

#### 5-3. 기존 default 설정 비활성화 (선택사항)

```bash
# 기존 default 사이트 비활성화 (포트 80 충돌 방지)
sudo rm /etc/nginx/sites-enabled/default
```

#### 5-4. 새 설정 활성화

```bash
# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/mygramwon /etc/nginx/sites-enabled/

# 설정 문법 검사
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx

# Nginx 상태 확인
sudo systemctl status nginx
```

---

### 6단계: 방화벽 설정 (필요시)

```bash
# UFW 사용 중이라면
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

---

### 7단계: 접속 테스트

#### 7-1. 직접 접속 테스트 (포트 3000)

```bash
curl http://localhost:3000
```

#### 7-2. Nginx를 통한 접속 테스트 (포트 80)

```bash
curl http://localhost
```

#### 7-3. 외부 브라우저 접속

```
http://서버IP주소
또는
http://your-domain.com
```

#### 7-4. 로그인 테스트

1. 로그인 페이지 접속: `http://서버IP/login`
2. ID: `gram`, PW: `3535` 입력
3. 로그인 후 대시보드 확인

---

## 🔧 포트별 접속 정리

| 접속 방법 | URL | 용도 |
|----------|-----|------|
| Docker 직접 | `http://서버IP:3000` | 개발/테스트 |
| Nginx 경유 | `http://서버IP` 또는 `http://도메인` | 운영 (권장) |

---

## 🆘 문제 해결

### 문제 1: Nginx 설정 오류

```bash
# 설정 문법 확인
sudo nginx -t

# 오류가 있다면 설정 파일 재확인
sudo nano /etc/nginx/sites-available/mygramwon

# Nginx 로그 확인
sudo tail -f /var/log/nginx/error.log
```

### 문제 2: 포트 80 이미 사용 중

```bash
# 포트 80 사용 프로세스 확인
sudo lsof -i :80

# 기존 Nginx 설정 충돌 확인
ls /etc/nginx/sites-enabled/

# default 사이트 비활성화
sudo rm /etc/nginx/sites-enabled/default
sudo systemctl restart nginx
```

### 문제 3: Docker 컨테이너 실행 실패

```bash
# 로그 확인
docker compose logs

# 컨테이너 재시작
docker compose down
docker compose up -d --build

# 포트 3000 충돌 확인
sudo lsof -i :3000
sudo kill -9 <PID>
```

### 문제 4: Nginx가 Docker 컨테이너에 접속 안됨

```bash
# Docker 컨테이너 상태 확인
docker compose ps

# localhost:3000 직접 접속 테스트
curl http://localhost:3000

# Nginx 프록시 패스 확인
sudo nano /etc/nginx/sites-available/mygramwon
# proxy_pass http://localhost:3000; 확인
```

---

## 🔄 기존 프로젝트로 롤백 (문제 발생 시)

```bash
# 1. 새 프로젝트 중지
cd ~/mygramwon
docker compose down

# 2. Nginx 설정 원복
sudo rm /etc/nginx/sites-enabled/mygramwon
sudo ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/
sudo systemctl restart nginx

# 3. 기존 프로젝트 복구
cd ~
mv mygramwon mygramwon_failed
mv mygramwon_backup_* mygramwon
cd mygramwon

# 4. 기존 방식으로 재시작 (PM2 등)
pm2 start ecosystem.config.js
# 또는
npm run start
```

---

## ✅ 배포 완료 체크리스트

- [ ] 기존 Node.js 프로세스 완전 종료
- [ ] 새 프로젝트 파일 업로드 완료
- [ ] .env 파일 설정 완료
- [ ] Docker 컨테이너 정상 실행
- [ ] `docker compose ps` 확인 (Up 상태)
- [ ] `curl http://localhost:3000` 응답 확인
- [ ] Nginx 설정 완료
- [ ] `sudo nginx -t` 문법 검사 통과
- [ ] Nginx 재시작 완료
- [ ] `curl http://localhost` 응답 확인
- [ ] 외부 브라우저에서 접속 확인
- [ ] 로그인 테스트 성공
- [ ] Google Sheets 데이터 표시 확인
- [ ] 모바일 UI 확인

---

## 📊 서버 상태 모니터링

```bash
# Docker 컨테이너 상태
docker compose ps

# 실시간 로그
docker compose logs -f

# 리소스 사용량
docker stats mygramwon

# Nginx 상태
sudo systemctl status nginx

# Nginx 로그
sudo tail -f /var/log/nginx/mygramwon-access.log
sudo tail -f /var/log/nginx/mygramwon-error.log
```

---

## 🔐 SSL 인증서 설정 (선택사항)

도메인이 있다면 무료 SSL 인증서 설치:

```bash
# Certbot 설치
sudo apt update
sudo apt install certbot python3-certbot-nginx

# SSL 인증서 발급 및 Nginx 자동 설정
sudo certbot --nginx -d gramwon.me -d www.gramwon.me

# 자동 갱신 테스트
sudo certbot renew --dry-run
```

설치 후 자동으로 HTTPS 설정이 완료됩니다.

접속: `https://gramwon.me`

---

## 🚀 업데이트 배포 (코드 변경 시)

```bash
# 1. 새 코드로 파일 업데이트 (VS Code 또는 git pull)
cd ~/mygramwon
git pull origin main  # Git 사용 시

# 2. Docker 재빌드 및 재시작
docker compose up -d --build

# 3. 로그 확인
docker compose logs -f

# 4. 캐시 클리어 (필요시)
docker system prune -f
```

---

## 완료! 🎉

배포가 완료되었습니다.

**접속 주소:**
- 도메인 (권장): `http://gramwon.me`
- SSL 설정 시: `https://gramwon.me`
- 직접 접속: `http://서버IP:3000`

**로그인:**
- ID: `gram`
- PW: `3535`
