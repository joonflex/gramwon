# gramwon.me 도메인 설정 가이드

## 전제 조건
- ✅ Docker 컨테이너가 3000 포트에서 실행 중
- ✅ Nginx가 설치되어 있음
- ✅ gramwon.me 도메인이 서버 IP를 가리키고 있음 (DNS 설정 완료)

---

## 📋 설정 절차

### 1단계: DNS 설정 확인

도메인이 서버 IP를 올바르게 가리키는지 확인:

```bash
# 도메인 → IP 확인
nslookup gramwon.me
dig gramwon.me

# 서버의 공인 IP 확인
curl ifconfig.me
```

**결과 확인:**
- `gramwon.me`의 A 레코드가 서버의 공인 IP를 가리켜야 함
- 전파 시간: 보통 5분~24시간 소요

---

### 2단계: Nginx 설정 파일 생성

```bash
sudo nano /etc/nginx/sites-available/mygramwon
```

**파일 내용 (복사해서 붙여넣기):**

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

---

### 3단계: 기존 설정 확인 및 정리

```bash
# 기존 설정 파일 확인
ls -la /etc/nginx/sites-enabled/

# 기존 default 설정이 있다면 비활성화 (포트 80 충돌 방지)
sudo rm /etc/nginx/sites-enabled/default

# 기존 mygramwon 설정이 있다면 제거
sudo rm /etc/nginx/sites-enabled/mygramwon
```

---

### 4단계: 새 설정 활성화

```bash
# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/mygramwon /etc/nginx/sites-enabled/

# 설정 문법 검사
sudo nginx -t

# 정상이면 다음과 같이 출력됨:
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

---

### 5단계: Nginx 재시작

```bash
# Nginx 재시작
sudo systemctl restart nginx

# 상태 확인
sudo systemctl status nginx

# 정상이면 "active (running)" 표시
```

---

### 6단계: 접속 테스트

#### 6-1. 서버 내부 테스트

```bash
# Docker 직접 접속 테스트
curl http://localhost:3000

# Nginx를 통한 접속 테스트
curl http://localhost

# Host 헤더 포함 테스트
curl -H "Host: gramwon.me" http://localhost
```

모두 HTML 응답이 나와야 합니다.

#### 6-2. 외부 브라우저 테스트

**브라우저에서 접속:**
```
http://gramwon.me
http://www.gramwon.me
```

**확인사항:**
- ✅ 페이지가 정상적으로 로드됨
- ✅ 로그인 페이지 표시
- ✅ 로그인 가능 (ID: gram, PW: 3535)
- ✅ 데이터 테이블 표시

---

### 7단계: SSL 인증서 설치 (HTTPS)

무료 Let's Encrypt SSL 인증서 설치:

```bash
# Certbot 설치 (설치되어 있지 않다면)
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# SSL 인증서 발급 및 Nginx 자동 설정
sudo certbot --nginx -d gramwon.me -d www.gramwon.me
```

**Certbot 프롬프트 응답:**
1. 이메일 입력: (알림용 이메일 주소 입력)
2. 약관 동의: `Y`
3. 뉴스레터 수신: `N` (선택)
4. Redirect 설정: `2` (HTTP → HTTPS 자동 리다이렉트 권장)

**인증서 발급 성공 시:**
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/gramwon.me/fullchain.pem
Key is saved at: /etc/letsencrypt/live/gramwon.me/privkey.pem
```

---

### 8단계: HTTPS 접속 테스트

```bash
# HTTPS 접속 테스트
curl https://gramwon.me

# 브라우저에서 접속
# https://gramwon.me
```

**확인사항:**
- ✅ 자물쇠 아이콘 표시
- ✅ http://gramwon.me 접속 시 https로 자동 리다이렉트
- ✅ 보안 경고 없음

---

### 9단계: 자동 갱신 설정 확인

SSL 인증서는 90일마다 갱신 필요 (자동 설정됨):

```bash
# 자동 갱신 테스트 (실제 갱신 안됨)
sudo certbot renew --dry-run

# 성공 메시지 확인:
# Congratulations, all simulated renewals succeeded
```

자동 갱신은 systemd 타이머로 설정됨:
```bash
# 타이머 상태 확인
sudo systemctl status certbot.timer
```

---

## 🔧 문제 해결

### 문제 1: DNS가 서버를 가리키지 않음

**증상:**
```bash
nslookup gramwon.me
# Server can't find gramwon.me: NXDOMAIN
```

**해결:**
1. 도메인 등록 업체(가비아, 후이즈 등)의 DNS 관리 페이지 접속
2. A 레코드 설정:
   - 호스트: `@` (또는 비워둠)
   - 타입: `A`
   - 값: 서버의 공인 IP 주소
   - TTL: 300 또는 자동
3. www 서브도메인 추가:
   - 호스트: `www`
   - 타입: `A`
   - 값: 서버의 공인 IP 주소
4. 5분~24시간 대기 후 재확인

### 문제 2: Nginx 설정 오류

**증상:**
```bash
sudo nginx -t
# nginx: [emerg] unexpected "}" in /etc/nginx/sites-available/mygramwon:XX
```

**해결:**
```bash
# 설정 파일 재확인
sudo nano /etc/nginx/sites-available/mygramwon

# 중괄호 { } 짝 확인
# 세미콜론 ; 누락 확인
```

### 문제 3: 포트 80/443 충돌

**증상:**
```bash
sudo nginx -t
# nginx: [emerg] bind() to 0.0.0.0:80 failed (98: Address already in use)
```

**해결:**
```bash
# 포트 사용 프로세스 확인
sudo lsof -i :80
sudo lsof -i :443

# 기존 Nginx 프로세스 종료
sudo systemctl stop nginx
sudo systemctl start nginx

# 다른 웹서버(Apache 등) 확인
sudo systemctl stop apache2
```

### 문제 4: SSL 인증서 발급 실패

**증상:**
```bash
sudo certbot --nginx -d gramwon.me
# Challenge failed for domain gramwon.me
```

**원인 및 해결:**
1. **DNS가 아직 전파 안됨**
   ```bash
   # DNS 확인
   nslookup gramwon.me
   # 서버 IP와 일치하는지 확인
   ```

2. **방화벽이 80/443 포트 막음**
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

3. **Nginx가 실행 중이 아님**
   ```bash
   sudo systemctl status nginx
   sudo systemctl start nginx
   ```

### 문제 5: Docker 컨테이너가 응답 안함

**증상:**
```bash
curl http://localhost:3000
# curl: (7) Failed to connect to localhost port 3000
```

**해결:**
```bash
# 컨테이너 상태 확인
docker compose ps

# 중지되어 있다면 재시작
cd ~/mygramwon
docker compose up -d

# 로그 확인
docker compose logs -f
```

### 문제 6: 브라우저에서 502 Bad Gateway

**증상:**
브라우저에서 gramwon.me 접속 시 "502 Bad Gateway" 표시

**해결:**
```bash
# 1. Docker 컨테이너 확인
docker compose ps
# STATUS가 "Up"인지 확인

# 2. Nginx 로그 확인
sudo tail -f /var/log/nginx/mygramwon-error.log

# 3. proxy_pass 주소 확인
sudo nano /etc/nginx/sites-available/mygramwon
# proxy_pass http://localhost:3000; 확인

# 4. Nginx 재시작
sudo systemctl restart nginx
```

---

## 📊 최종 확인 체크리스트

### DNS 설정
- [ ] `nslookup gramwon.me`로 서버 IP 확인
- [ ] `nslookup www.gramwon.me`로 서버 IP 확인

### Nginx 설정
- [ ] `/etc/nginx/sites-available/mygramwon` 파일 존재
- [ ] `/etc/nginx/sites-enabled/mygramwon` 심볼릭 링크 존재
- [ ] `sudo nginx -t` 문법 검사 통과
- [ ] `sudo systemctl status nginx` active 상태

### Docker 컨테이너
- [ ] `docker compose ps` Up 상태
- [ ] `curl http://localhost:3000` 응답 성공
- [ ] `docker compose logs` 에러 없음

### 접속 테스트
- [ ] `curl http://localhost` 응답 성공
- [ ] 브라우저에서 `http://gramwon.me` 접속 성공
- [ ] 로그인 페이지 표시
- [ ] 로그인 기능 정상 동작

### SSL (선택사항)
- [ ] `sudo certbot --nginx` 인증서 발급 성공
- [ ] 브라우저에서 `https://gramwon.me` 접속 성공
- [ ] 자물쇠 아이콘 표시
- [ ] HTTP → HTTPS 자동 리다이렉트

---

## 🎯 빠른 설정 스크립트

모든 명령을 한번에 실행:

```bash
# 1. Nginx 설정 파일 생성
sudo tee /etc/nginx/sites-available/mygramwon > /dev/null <<'EOF'
server {
    listen 80;
    server_name gramwon.me www.gramwon.me;

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
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# 2. 기존 설정 제거 및 새 설정 활성화
sudo rm -f /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/sites-enabled/mygramwon
sudo ln -s /etc/nginx/sites-available/mygramwon /etc/nginx/sites-enabled/

# 3. 설정 검사 및 재시작
sudo nginx -t && sudo systemctl restart nginx

# 4. 상태 확인
sudo systemctl status nginx
docker compose ps

echo "✅ Nginx 설정 완료!"
echo "접속: http://gramwon.me"
```

---

## 🔐 SSL 인증서 빠른 설치

```bash
# Certbot 설치 및 SSL 인증서 발급
sudo apt update && sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d gramwon.me -d www.gramwon.me

echo "✅ SSL 설치 완료!"
echo "접속: https://gramwon.me"
```

---

## 완료! 🎉

이제 `gramwon.me`로 접속할 수 있습니다!

**접속 주소:**
- HTTP: `http://gramwon.me`
- HTTPS: `https://gramwon.me` (SSL 설치 후)

**로그인 정보:**
- ID: `gram`
- PW: `3535`

**관리 명령어:**
```bash
# Nginx 재시작
sudo systemctl restart nginx

# Nginx 로그
sudo tail -f /var/log/nginx/mygramwon-access.log

# Docker 로그
docker compose logs -f

# SSL 갱신 테스트
sudo certbot renew --dry-run
```
