#!/bin/bash

# mygramwon 배포 스크립트
# 사용법: bash deploy.sh

set -e

echo "=================================="
echo "mygramwon 배포 스크립트"
echo "=================================="
echo ""

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1단계: 기존 프로세스 정리
echo -e "${YELLOW}[1/7] 기존 Next.js 프로세스 정리 중...${NC}"

# PM2 프로세스 확인 및 정리
if command -v pm2 &> /dev/null; then
    echo "PM2 프로세스 정리 중..."
    pm2 stop all 2>/dev/null || true
    pm2 delete all 2>/dev/null || true
    pm2 kill 2>/dev/null || true
fi

# 포트 3000 사용 중인 프로세스 종료
if sudo lsof -i :3000 &> /dev/null; then
    echo "포트 3000 사용 중인 프로세스 종료 중..."
    sudo lsof -ti :3000 | xargs sudo kill -9 2>/dev/null || true
fi

echo -e "${GREEN}✓ 기존 프로세스 정리 완료${NC}"
echo ""

# 2단계: 프로젝트 디렉토리 확인
echo -e "${YELLOW}[2/7] 프로젝트 디렉토리 확인 중...${NC}"

if [ -d ~/mygramwon ]; then
    echo "기존 프로젝트 백업 중..."
    BACKUP_NAME="mygramwon_backup_$(date +%Y%m%d_%H%M%S)"
    mv ~/mygramwon ~/$BACKUP_NAME
    echo -e "${GREEN}✓ 백업 완료: ~/$BACKUP_NAME${NC}"
fi

mkdir -p ~/mygramwon
echo -e "${GREEN}✓ 프로젝트 디렉토리 준비 완료${NC}"
echo ""

# 3단계: 파일 확인
echo -e "${YELLOW}[3/7] 배포 파일 확인 중...${NC}"

if [ ! -f ~/mygramwon/Dockerfile ]; then
    echo -e "${RED}✗ 오류: 프로젝트 파일이 ~/mygramwon에 없습니다.${NC}"
    echo "VS Code나 scp로 파일을 먼저 업로드해주세요."
    exit 1
fi

echo -e "${GREEN}✓ 배포 파일 확인 완료${NC}"
echo ""

# 4단계: 환경변수 확인
echo -e "${YELLOW}[4/7] 환경변수 확인 중...${NC}"

cd ~/mygramwon

if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ .env 파일이 없습니다. 생성합니다...${NC}"

    # SESSION_SECRET 자동 생성
    SESSION_SECRET=$(openssl rand -base64 32)

    cat > .env << EOF
AUTH_ID=gram
AUTH_PASSWORD=3535
SESSION_SECRET=$SESSION_SECRET
GOOGLE_SHEET_ID=1B-To8hwa2mWOByQR0eLifNMAd-3OaqhOHZtWKScUJsE
EOF

    echo -e "${GREEN}✓ .env 파일 생성 완료${NC}"
else
    echo -e "${GREEN}✓ .env 파일 존재${NC}"
fi

echo ""

# 5단계: Docker 실행
echo -e "${YELLOW}[5/7] Docker 컨테이너 빌드 및 실행 중...${NC}"
echo "이 작업은 2-5분 정도 소요됩니다..."

docker compose down 2>/dev/null || true
docker compose up -d --build

echo -e "${GREEN}✓ Docker 컨테이너 실행 완료${NC}"
echo ""

# 6단계: 실행 확인
echo -e "${YELLOW}[6/7] 컨테이너 상태 확인 중...${NC}"

sleep 5

if docker compose ps | grep -q "Up"; then
    echo -e "${GREEN}✓ 컨테이너 정상 실행 중${NC}"
    docker compose ps
else
    echo -e "${RED}✗ 컨테이너 실행 실패${NC}"
    echo "로그를 확인하세요: docker compose logs"
    exit 1
fi

echo ""

# 7단계: 접속 테스트
echo -e "${YELLOW}[7/7] 접속 테스트 중...${NC}"

sleep 3

if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✓ 애플리케이션 정상 응답${NC}"
else
    echo -e "${RED}✗ 애플리케이션 응답 없음${NC}"
    echo "로그를 확인하세요: docker compose logs"
    exit 1
fi

echo ""
echo "=================================="
echo -e "${GREEN}배포 완료! 🎉${NC}"
echo "=================================="
echo ""
echo "접속 정보:"
echo "  - 직접 접속: http://localhost:3000"
echo "  - 외부 접속: http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "로그인 정보:"
echo "  - ID: gram"
echo "  - PW: 3535"
echo ""
echo "관리 명령어:"
echo "  - 로그 확인: docker compose logs -f"
echo "  - 재시작: docker compose restart"
echo "  - 중지: docker compose stop"
echo ""
