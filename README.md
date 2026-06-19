# 매일 운동기록 PWA

러닝과 웨이트를 매일 기록하는 모바일용 PWA입니다.

## 기능
- 날짜별 운동 기록
- 러닝 거리/시간/메모
- 웨이트 운동명, 무게, 횟수, 세트 기록
- 이번 주 러닝 거리, 운동 횟수, 연속 기록 표시
- 최근 기록 조회
- JSON 백업 다운로드
- 오프라인 사용 가능한 PWA
- 홈화면 추가 지원

## GitHub → Vercel 배포 방법
1. 이 zip 파일을 압축 해제합니다.
2. GitHub에서 새 저장소를 만듭니다.
3. 압축 해제한 파일 전체를 업로드합니다. `index.html`이 저장소 최상단에 있어야 합니다.
4. Vercel에서 Add New Project를 누르고 GitHub 저장소를 선택합니다.
5. Framework Preset은 `Other` 또는 자동 감지 그대로 둡니다.
6. Build Command는 비워둡니다.
7. Output Directory도 비워둡니다.
8. Deploy를 누릅니다.

## 모바일 홈화면 추가
- Android Chrome: 배포된 Vercel 주소 접속 → 메뉴(⋮) → 홈 화면에 추가 또는 앱 설치
- iPhone Safari: 공유 버튼 → 홈 화면에 추가

## 데이터 저장 위치
기록은 휴대폰 브라우저의 LocalStorage에 저장됩니다. 브라우저 데이터를 삭제하면 기록도 삭제될 수 있으니 가끔 앱 안의 `백업` 버튼으로 저장하세요.
