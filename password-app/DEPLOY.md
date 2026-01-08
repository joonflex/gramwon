# 배포 가이드

## [A] 생성/수정된 파일 목록

```
✅ Dockerfile (신규)
✅ docker-compose.yml (신규)
✅ .dockerignore (신규)
✅ next.config.js (수정: output: 'standalone' 추가)
✅ .env.example (기존)
✅ DEPLOY.md (이 문서)
```

---

## [B] 서버 배포 절차

### 1단계: 서버 접속 및 프로젝트 준비

```bash
# Ubuntu 서버에 SSH 접속 (VS Code Remote-SSH로 접속된 상태)

# 프로젝트 디렉토리 생성
mkdir -p ~/mygramwon
cd ~/mygramwon

# Git clone (또는 파일 복사)
# 방법 1: Git 저장소가 있는 경우
git clone <YOUR_REPO_URL> .

# 방법 2: 로컬에서 파일 전송 (VS Code에서 드래그 앤 드롭 또는 scp)
# scp -r /Users/joonflex/Desktop/code/* user@server:~/mygramwon/
```

### 2단계: 환경변수 설정

```bash
# .env 파일 생성 (서버에서)
cd ~/mygramwon
nano .env
```

**`.env` 파일 내용:**
```bash
# Authentication
AUTH_ID=gram
AUTH_PASSWORD=3535

# Session Secret (반드시 변경하세요!)
SESSION_SECRET=production-secret-change-this-to-random-string-min-32-chars

# Google Spreadsheet
GOOGLE_SHEET_ID=1B-To8hwa2mWOByQR0eLifNMAd-3OaqhOHZtWKScUJsE
```

**⚠️ 보안 주의사항:**
- `SESSION_SECRET`는 반드시 32자 이상의 무작위 문자열로 변경
- 생성 방법: `openssl rand -base64 32`
- `.env` 파일은 절대 Git에 커밋하지 말 것

### 3단계: Docker 빌드 및 실행

```bash
# Docker Compose로 빌드 및 실행
cd ~/mygramwon
docker compose up -d --build
```

**명령어 설명:**
- `up`: 컨테이너 시작
- `-d`: 백그라운드 실행 (detached mode)
- `--build`: 이미지 새로 빌드

### 4단계: 실행 확인

```bash
# 컨테이너 상태 확인
docker compose ps

# 로그 확인
docker compose logs -f

# 특정 시간의 로그만 보기
docker compose logs --tail=100

# 컨테이너 중지 없이 로그 종료: Ctrl + C
```

**정상 실행 시 출력 예시:**
```
NAME          IMAGE              STATUS         PORTS
mygramwon     mygramwon:latest   Up 30 seconds  0.0.0.0:3000->3000/tcp
```

### 5단계: 포트 및 방화벽 설정

```bash
# 포트 사용 확인
sudo netstat -tulpn | grep 3000

# UFW 방화벽 사용 시 포트 열기
sudo ufw allow 3000/tcp
sudo ufw status
```

---

## [C] 접속 테스트

### 로컬 테스트 (서버 내부)

```bash
# 서버에서 curl 테스트
curl http://localhost:3000

# 정상이면 HTML 응답이 표시됩니다
```

### 외부 접속 테스트

1. **브라우저에서 접속:**
   ```
   http://<서버IP>:3000
   ```

2. **로그인 페이지 접속:**
   ```
   http://<서버IP>:3000/login
   ```

3. **로그인 테스트:**
   - ID: `gram`
   - PW: `3535`

4. **Google Sheets 데이터 확인:**
   - 로그인 후 대시보드에서 데이터 테이블 표시 확인

5. **모바일 UI 테스트:**
   - 브라우저 개발자 도구 (F12)
   - Device Toolbar (Ctrl+Shift+M)
   - 모바일 화면(768px 미만)에서 카드형 레이아웃 확인

---

## [D] 배포 후 검증 체크리스트

### ✅ 필수 확인사항

- [ ] 컨테이너가 정상 실행 중 (`docker compose ps`)
- [ ] 로그에 에러 없음 (`docker compose logs`)
- [ ] 로그인 페이지 접속 가능
- [ ] 로그인 성공 및 리다이렉션 정상
- [ ] Google Sheets 데이터 정상 표시
- [ ] 비밀번호 마스킹 및 토글 동작
- [ ] 복사 버튼 동작
- [ ] 로그아웃 정상 동작
- [ ] 모바일 화면에서 카드형 레이아웃 표시

### ✅ 성능 확인

- [ ] 초기 로딩 속도 (1초 이내)
- [ ] 재방문 시 캐시 동작 (0.1초 이내)
- [ ] Header 로그인/로그아웃 버튼 전환

---

## [E] 문제 발생 시 대응 가이드

### 🔴 문제 1: 빌드 실패

**증상:**
```bash
ERROR [builder 5/5] RUN npm run build
```

**해결:**
```bash
# 로컬에서 빌드 테스트
npm run build

# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
npm run build

# 성공하면 서버에 다시 배포
```

### 🔴 문제 2: 포트 충돌

**증상:**
```
Error: bind: address already in use
```

**해결:**
```bash
# 포트 사용 프로세스 확인
sudo lsof -i :3000

# 프로세스 종료
sudo kill -9 <PID>

# 또는 docker-compose.yml에서 포트 변경
ports:
  - "8080:3000"  # 외부 포트를 8080으로 변경
```

### 🔴 문제 3: 환경변수 미적용

**증상:**
- 로그인 실패
- Google Sheets 데이터 안 보임

**해결:**
```bash
# .env 파일 존재 확인
cat .env

# 컨테이너 환경변수 확인
docker compose exec mygramwon env | grep AUTH

# .env 수정 후 컨테이너 재시작
docker compose down
docker compose up -d
```

### 🔴 문제 4: 컨테이너 재시작

```bash
# 컨테이너 중지
docker compose down

# 컨테이너 시작 (기존 이미지 사용)
docker compose up -d

# 이미지 재빌드 후 시작
docker compose up -d --build

# 모든 것 삭제 후 재시작 (데이터 삭제 주의)
docker compose down -v
docker compose up -d --build
```

### 🔴 문제 5: 로그 확인

```bash
# 실시간 로그
docker compose logs -f

# 최근 100줄
docker compose logs --tail=100

# 특정 시간 이후
docker compose logs --since 10m

# 컨테이너 내부 접속
docker compose exec mygramwon sh
```

### 🔴 문제 6: Google Sheets 데이터 안 보임

**원인:**
- Google Sheets가 비공개 상태
- GOOGLE_SHEET_ID 오타

**해결:**
```bash
# 1. Google Sheets 공개 설정 확인
# - Google Sheets > 공유 > "링크가 있는 모든 사용자" 설정

# 2. Sheet ID 확인
# URL: https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
# SHEET_ID 부분만 .env에 입력

# 3. 컨테이너 재시작
docker compose down
docker compose up -d
```

---

## [F] 서버 관리 명령어 모음

```bash
# 컨테이너 상태 확인
docker compose ps

# 컨테이너 중지
docker compose stop

# 컨테이너 시작
docker compose start

# 컨테이너 재시작
docker compose restart

# 컨테이너 완전 삭제
docker compose down

# 이미지까지 삭제
docker compose down --rmi all

# 볼륨까지 삭제 (주의!)
docker compose down -v

# 리소스 사용량 확인
docker stats mygramwon

# 디스크 사용량 정리
docker system prune -a
```

---

## [G] 업데이트 배포

```bash
# 1. Git pull (코드 업데이트)
cd ~/mygramwon
git pull origin main

# 2. 재빌드 및 재시작
docker compose up -d --build

# 3. 로그 확인
docker compose logs -f
```

---

## [H] Nginx 리버스 프록시 설정 (선택사항)

도메인으로 접속하려면 Nginx 설정:

```bash
# Nginx 설치
sudo apt update
sudo apt install nginx

# 설정 파일 생성
sudo nano /etc/nginx/sites-available/mygramwon
```

**Nginx 설정 파일:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

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
    }
}
```

**활성화:**
```bash
sudo ln -s /etc/nginx/sites-available/mygramwon /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## [I] SSL 인증서 설정 (선택사항)

```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d your-domain.com

# 자동 갱신 테스트
sudo certbot renew --dry-run
```

---

## 완료! 🎉

배포가 완료되었습니다.

**접속 주소:**
- HTTP: `http://<서버IP>:3000`
- 도메인 설정 시: `http://your-domain.com`
- SSL 설정 시: `https://your-domain.com`

**로그인 정보:**
- ID: `gram`
- PW: `3535`
