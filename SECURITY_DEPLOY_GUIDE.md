# 보안 강화 배포 가이드

## 🔒 새 서버 보안 설정 (최우선)

### 1단계: SSH 보안 강화

```bash
# 서버 접속
ssh root@<SERVER_IP>

# SSH 설정 수정
sudo nano /etc/ssh/sshd_config
```

다음 내용 수정:
```
PermitRootLogin prohibit-password
PasswordAuthentication no
PubkeyAuthentication yes
```

```bash
# SSH 재시작
sudo systemctl restart sshd
```

### 2단계: 방화벽 설정 (매우 중요!)

```bash
# UFW 기본 정책: 모든 수신/송신 차단
sudo ufw default deny incoming
sudo ufw default deny outgoing

# SSH 허용 (22번 포트)
sudo ufw allow 22/tcp

# HTTP/HTTPS 허용
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# DNS 아웃바운드 허용 (필수)
sudo ufw allow out 53/udp
sudo ufw allow out 53/tcp

# NTP 아웃바운드 허용
sudo ufw allow out 123/udp

# HTTP/HTTPS 아웃바운드 허용 (npm install 등)
sudo ufw allow out 80/tcp
sudo ufw allow out 443/tcp

# 방화벽 활성화
sudo ufw enable

# 상태 확인
sudo ufw status verbose
```

### 3단계: Fail2ban 설치 (무차별 대입 공격 방어)

```bash
sudo apt update
sudo apt install -y fail2ban

# Fail2ban 설정
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local
```

jail.local에서 설정:
```ini
[sshd]
enabled = true
port = 22
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
findtime = 600
```

```bash
# Fail2ban 시작
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# 상태 확인
sudo fail2ban-client status sshd
```

### 4단계: 시스템 업데이트 및 보안 패키지 설치

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y unattended-upgrades apt-listchanges
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 🐳 Docker 보안 설정

### 1. Docker 설치

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo systemctl enable docker
sudo systemctl start docker
```

### 2. Docker 데몬 보안 설정

```bash
sudo nano /etc/docker/daemon.json
```

다음 내용 추가:
```json
{
  "icc": false,
  "userland-proxy": false,
  "no-new-privileges": true,
  "live-restore": true,
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

```bash
sudo systemctl restart docker
```

### 3. Docker Compose 설치

```bash
sudo apt install -y docker-compose
docker-compose --version
```

---

## 📦 프로젝트 배포

### 1. GitHub에서 클론

```bash
cd ~
git clone https://github.com/joonflex/gramwon.git
cd gramwon
```

### 2. 환경변수 설정

```bash
cd ~/gramwon/password-app
nano .env
```

.env 파일 내용:
```bash
AUTH_ID=gram
AUTH_PASSWORD=3535
GOOGLE_SHEET_ID=1B-To8hwa2mWOByQR0eLifNMAd-3OaqhOHZtWKScUJsE
```

SESSION_SECRET 생성:
```bash
echo "SESSION_SECRET=$(openssl rand -base64 32)" >> .env
```

### 3. Docker 이미지 빌드 및 실행

```bash
cd ~/gramwon

# 빌드 (10-15분 소요)
docker-compose build --no-cache

# 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

### 4. 컨테이너 보안 확인

```bash
# 컨테이너가 root로 실행되지 않는지 확인
docker exec gramwon-password whoami
# 출력: nextjs (root가 아님)

# 읽기 전용 파일시스템 확인
docker inspect gramwon-password | grep ReadonlyRootfs
# 출력: "ReadonlyRootfs": true

# Capabilities 확인
docker inspect gramwon-password | grep -A 20 CapDrop
```

---

## 🌐 Nginx 보안 설정

### 1. Nginx 설치

```bash
sudo apt install -y nginx
```

### 2. Nginx 설정

```bash
sudo cp ~/gramwon/nginx-gramwon.conf /etc/nginx/sites-available/gramwon
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/gramwon /etc/nginx/sites-enabled/
```

### 3. 보안 헤더 추가

```bash
sudo nano /etc/nginx/sites-available/gramwon
```

server 블록 안에 추가:
```nginx
# 보안 헤더
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

# HTTPS로 리다이렉트 (SSL 설정 후)
# add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 4. SSL 인증서 설치

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d gramwon.me -d www.gramwon.me
```

SSL 설치 후 HSTS 헤더 활성화:
```bash
sudo nano /etc/nginx/sites-available/gramwon
```

다음 줄의 주석 제거:
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

```bash
sudo systemctl reload nginx
```

---

## 🔍 보안 모니터링

### 1. 실시간 로그 모니터링

```bash
# Docker 로그
docker-compose logs -f --tail=100

# Nginx 로그
sudo tail -f /var/log/nginx/gramwon-access.log
sudo tail -f /var/log/nginx/gramwon-error.log

# 시스템 로그
sudo tail -f /var/log/syslog
```

### 2. 의심스러운 활동 감지

```bash
# 외부 UDP 트래픽 모니터링
sudo tcpdump -n udp and not port 53 and not port 123 -c 50

# 비정상적인 프로세스 확인
ps aux --sort=-%cpu | head -20
ps aux --sort=-%mem | head -20

# 열린 포트 확인
sudo netstat -tlnp
sudo ss -tlnp
```

### 3. 정기 보안 점검

```bash
# 시스템 업데이트 확인 (매주)
sudo apt update
sudo apt list --upgradable

# Docker 이미지 업데이트 확인 (매월)
docker images
docker pull node:20-alpine

# 로그 확인 (매일)
sudo journalctl -xe --since today
```

---

## ⚠️ 보안 체크리스트

배포 전 필수 확인 사항:

- [ ] SSH 비밀번호 로그인 비활성화
- [ ] UFW 방화벽 활성화 (inbound/outbound 모두 제한)
- [ ] Fail2ban 설치 및 활성화
- [ ] Docker 컨테이너가 root가 아닌 사용자로 실행
- [ ] Docker 컨테이너 읽기 전용 파일시스템 설정
- [ ] Docker 포트가 127.0.0.1에만 바인딩
- [ ] Nginx 보안 헤더 설정
- [ ] SSL/TLS 인증서 설치
- [ ] 자동 보안 업데이트 활성화
- [ ] 정기 백업 설정

---

## 🆘 비상 대응

### 악성코드 감염 의심 시

```bash
# 1. 즉시 모든 컨테이너 중지
docker-compose down

# 2. 의심스러운 프로세스 확인
ps aux | grep -v "\[" | sort -rk 3,3 | head -20

# 3. 외부 연결 확인
sudo netstat -anp | grep ESTABLISHED

# 4. 최근 생성된 파일 확인
find /tmp /var/tmp /home -type f -mmin -60 2>/dev/null

# 5. crontab 확인
sudo crontab -l
ls -la /etc/cron.d/
```

### 공격 받고 있는 경우

```bash
# 1. 즉시 방화벽으로 차단
sudo ufw default deny incoming
sudo ufw default deny outgoing
sudo ufw reload

# 2. 공격 IP 확인
sudo tail -100 /var/log/nginx/gramwon-access.log

# 3. 특정 IP 차단
sudo ufw deny from <ATTACKER_IP>

# 4. Fail2ban 상태 확인
sudo fail2ban-client status
```

---

## 📚 추가 보안 권장사항

1. **정기 백업**
   - 데이터베이스 일일 백업
   - 설정 파일 버전 관리
   - 오프사이트 백업

2. **모니터링**
   - Uptime 모니터링 (UptimeRobot 등)
   - 로그 집계 (Logrotate 설정)
   - 디스크 사용량 모니터링

3. **액세스 제어**
   - SSH 키 정기 교체
   - 최소 권한 원칙 적용
   - 2FA 사용 권장

4. **네트워크 보안**
   - DDoS 방어 (Cloudflare 사용)
   - Rate limiting 설정
   - IP 화이트리스트 고려
