# CLAUDE.md
## Next.js + Google Spreadsheet Viewer Project

이 문서는 Claude가 이 프로젝트를 정확하고 일관되게 개발하기 위한 **최상위 작업 지침서**입니다.  
Claude는 항상 이 문서를 기준으로 판단하고 작업합니다.

---

## 1. 프로젝트 개요 (Project Overview)

### 목적
- Google Spreadsheet의 내용을 불러와
- **예쁜 UI의 웹페이지(Next.js)** 로 보여준다
- **로그인(비밀번호 보호)** 된 페이지로 접근 제한
- 서버에 **Docker로 배포** 가능한 구조

### 핵심 요구사항
- VS Code + Claude Code 환경에서 개발
- Next.js 기반
- UI는 깔끔하고 현대적으로 (Tailwind 기반)
- 헤더 영역 분리 가능
- 비밀번호 로그인 방식
- Google Spreadsheet 데이터 표시

---

## 2. 기술 스택 (Tech Stack)

- Framework: **Next.js (App Router)**
- Styling: **Tailwind CSS**
- Data Fetch: Google Sheets (Public / fetch)
- Auth: **단순 비밀번호 로그인 (Client + Middleware)**
- Deploy: **Docker + Node**
- Server: Linux (Ubuntu 기준)

---

## 3. Google Spreadsheet 정보

- Spreadsheet URL:
  https://docs.google.com/spreadsheets/d/1B-To8hwa2mWOByQR0eLifNMAd-3OaqhOHZtWKScUJsE/edit?gid=0#gid=0

### 데이터 사용 방식
- Google Sheet는 **읽기 전용**
- API Key 없이 **public fetch 방식** 우선
- 실패 시 구조 변경 제안 가능

---

## 4. 로그인 / 보안 정책 (Authentication)

### 로그인 방식
- ID / Password 입력 후 접근
- 서버 또는 미들웨어에서 검증

### 계정 정보 (고정)
- ID: `gram`
- PASSWORD: `3535`

### 보안 원칙
- 비밀번호를 UI에 노출하지 않음
- `.env` 사용
- 로그인 전에는 **데이터 페이지 접근 불가**
- 미들웨어 또는 서버 컴포넌트에서 보호

---

## 5. 화면 구조 (UI Layout)

### 기본 레이아웃
- Header 영역 (고정)
- Main Content 영역
- Footer (선택)

### Header 요구사항
- 컴포넌트로 분리 (`Header.tsx`)
- 메뉴:
  - 비밀번호 (로그인 페이지)

### 페이지 구성
- `/login` : 로그인 페이지
- `/` : 메인 데이터 페이지 (로그인 후)
- `/components/Header.tsx`

---

## 6. 디자인 가이드 (UI / UX)

- 전체 톤: **미니멀 + 깔끔 + B2B 느낌**
- 카드형 레이아웃
- 테이블 가독성 최우선
- 모바일 / 데스크탑 반응형 필수
- Tailwind Utility 적극 사용
- 과한 애니메이션 ❌

---

## 7. 폴더 구조 (Directory Structure)

예시:

.
├─ CLAUDE.md
├─ Dockerfile
├─ docker-compose.yml
├─ package.json
├─ next.config.js
├─ .env.example
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  ├─ login/
│  │  │  └─ page.tsx
│  │  └─ middleware.ts
│  ├─ components/
│  │  ├─ Header.tsx
│  │  └─ SheetTable.tsx
│  ├─ lib/
│  │  └─ googleSheet.ts
│  └─ styles/
└─ public/

---

## 8. 환경변수 (Environment Variables)

### .env.example