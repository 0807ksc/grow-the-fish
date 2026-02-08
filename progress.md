Original prompt: [$develop-web-game](/Users/sungchulkang/.codex/skills/develop-web-game/SKILL.md) 으로  입체로 물고기 잡아 먹는  게임을  만들려고 해

## TODO
- [x] 기본 3D 느낌 물고기 포식 게임 구현 (canvas 단일)
- [x] render_game_to_text / advanceTime / fullscreen(f) 구현
- [x] Playwright 액션 루프로 실제 플레이 검증
- [x] 스크린샷/콘솔 에러 확인 후 수정

## Notes
- 작업 시작: 빈 디렉터리에서 신규 프로젝트 생성

## Update 1
- `index.html`, `game.js` 생성
- 단일 canvas 기반 3D(원근 스케일) 느낌 물고기 포식 게임 구현
- 구현 항목: 시작 화면, 플레이/승리/패배, 점수/크기, 충돌/포식 판정
- `window.render_game_to_text`, `window.advanceTime(ms)`, `f` 전체화면 토글 및 `Esc` 종료 경로(fullscreen API) 연결

## Update 2
- Playwright 클라이언트 실행 시 `playwright` 모듈 누락 확인
- 로컬 설치 시도: `npm init -y` 성공, `npm install playwright` 실패 (네트워크/DNS 제한: ENOTFOUND registry.npmjs.org)
- 전역 node_modules에서도 `playwright` 미발견
- 대체 검증: `node --check game.js` 문법 확인 통과

## TODO (Next)
- 네트워크 허용 환경에서 `npm install playwright` 후 스킬 루프 실행
- 액션 버스트 기반으로 시작/이동/포식/재시작 흐름 캡처 및 콘솔 에러 검증

## Update 3
- 실존 어종 데이터 추가
  - 플레이어 선택 종: 흰동가리(Amphiprion ocellaris), 고등어(Scomber japonicus), 참다랑어(Thunnus orientalis)
  - 야생 개체 종: 멸치/정어리/고등어/방어/참다랑어
- 시작 화면에서 종 변경 추가: `1/2/3` 또는 `[ ]`
- HUD/게임 상태 텍스트(render_game_to_text)에 플레이어/야생 어종 표시
- 시각 보강: 어종별 무늬 차이(예: 흰동가리 줄무늬), 위협 개체 외곽선 표시

## Validation
- `node --check game.js`: 통과
- Playwright 클라이언트 재실행: 실패(환경 내 playwright 모듈 없음)

## TODO (Next)
- 네트워크 허용 후 `npm install playwright` 실행
- 종 선택 상태 포함 E2E 캡처(시작화면 선택 -> 플레이 -> 포식/패배/재시작)

## Update 4
- 조작/상태 개선
  - `P` 키 일시정지/재개 추가 (`playing <-> paused`)
  - HUD에 현재 모드 표시(`Mode`) 추가
- 가시성/판단성 개선
  - 가장 가까운 먹이/위협 물고기 탐색 함수(`nearestFish`) 추가
  - 플레이 중 타깃 안내선 및 하단 힌트 텍스트(`Target prey`, `Nearest threat`) 추가
  - 심도 차이에 따른 개체 알파 보정(`depthFade`)으로 전경/배경 구분 강화
- 테스트 출력 확장
  - `render_game_to_text`에 `target.nearestEdibleId`, `target.nearestThreatId` 추가
  - controls 설명에 `pause: p` 반영

## Validation
- `node --check game.js`: 통과 (2026-02-08)
- Playwright 기반 E2E: 미실행 (`playwright` 모듈 환경 부재)

## TODO (Next)
- 네트워크 허용 환경에서 `npm install playwright` 후 `$WEB_GAME_CLIENT` 실행
- E2E 루프에서 `P` 일시정지/재개, 타깃 힌트 렌더링, 재시작 흐름까지 스크린샷 검증

## Update 5
- E2E 환경 구성 완료
  - `npm install playwright` 성공
  - `npx playwright install chromium` 성공
- Playwright 클라이언트 실행 환경 정리
  - 스킬 스크립트 경로 모듈 해석 이슈로 워크스페이스 복사본(`web_game_playwright_client.mjs`) 사용
  - 테스트 입력 확장을 위해 키 매핑 추가(`p`, `r`, `q/e`, 숫자키 등)
- 자동 검증 실행 결과
  - 기본 플레이 시나리오: `/tmp/growTheFish-playwright` (shot/state 3회)
  - 재시작 시나리오: `/tmp/growTheFish-playwright-restart` (shot/state 1회)
  - 일시정지 고정 시나리오: `/tmp/growTheFish-playwright-paused-hold` (shot/state 1회)
  - 시각 검토 완료: `Mode: PAUSED` 오버레이, 타깃 가이드 라인, HUD 모드 표기 정상 확인
  - 상태 텍스트 검토 완료: `mode=paused/playing/gameover` 전이 및 `target.*` 필드 출력 정상

## Validation
- 정적: `node --check game.js` 통과
- E2E: Playwright 자동 실행 및 스크린샷/JSON 상태 확인 완료 (2026-02-08)
- 콘솔/페이지 에러: 아티팩트에 `errors-*.json` 미생성(새 에러 없음으로 판단)

## TODO (Next)
- 현재 밸런스는 초반 `gameover` 진입 빈도가 높음(기본 이동 루프에서 score 0 빈번)
- 난이도 조정 후보
  - 시작 직후 플레이어 주변 안전 반경 확대
  - 초반 5초간 위협 개체 충돌 여유치 완화
  - 초기 스폰에서 `size <= 1.0` 개체 비중 상향

## Update 6
- 대규모 콘텐츠 확장 반영
  - 맵 5종 추가: 강/늪지대/산호초/대양/북극
  - 수면(물 위/수중 분리) 렌더링 추가, 북극맵 빙판 연출 추가
  - 산호초맵 전용 연출 추가 및 북극 계열 스폰 제외 규칙 반영
- 생물 다양화
  - 물고기 외 생물 추가: 수장룡/어룡/바다거북/가재/문어/오징어/고래
  - 종별 타입(kind) 기반 입체 외형 렌더링(두족류/갑각류/파충류/고생물/포유류)
- 전투/스킬 시스템 추가
  - `K` 공격(근접 처치), `Shift` 스피드 부스트, `X` 흡인
  - 공격/흡인 쿨다운 및 HUD 표시
  - HP/처치수(kills) 시스템 추가
- 시점/연출 변경
  - 기본 시작 시 플레이어 꼬리 시점(facing -1)으로 시작
  - 카메라 look-ahead와 심도 투영으로 입체감 강화
- 개체수 증가
  - 초기 72마리, 동적 스폰 목표치 최대 170으로 상향
- 상태 출력 확장
  - `render_game_to_text`에 biome/skillState/kills/hp/facing 포함

## Validation
- `node --check game.js`: 통과 (2026-02-08)
- Playwright 자동 검증: `/tmp/growTheFish-latest`
  - 스크린샷 확인: 수면 분리, 꼬리 시점 플레이어, 개체 다량 렌더, 가이드 라인 정상
  - 상태 JSON 확인: 신규 생물군/맵/스킬 상태 필드 정상

## Update 7
- 맵 전환 입력 인식 보강
  - 레이아웃 영향이 적은 `KeyboardEvent.code` 기반 처리 추가(`Comma/Period`, `KeyN/KeyM`, `Digit4/Digit5`)
  - 플레이 중에도 맵 즉시 전환되도록 허용
  - 맵 전환 시 현재 맵에 맞지 않는 개체 필터링 + 개체수 보정 리스폰
- 안내/상태 텍스트 갱신
  - 시작 화면 맵 변경 키 안내를 `,./N/M/4/5`로 갱신
  - `render_game_to_text.controls` 동일 반영

## Validation
- `node --check game.js`: 통과 (2026-02-08, Update 7)

## Update 8
- 맵 체감 강화 5분 시스템 추가
  - 맵 전환 시 `biomeImpactTimer = 300`(초) 시작
  - 플레이 중 타이머 감소, 맵별 효과 강도는 잔여 시간 비율로 계산
  - 맵별 체감 효과 적용
    - 강: 물살 증가 + 소폭 가속
    - 늪지대: 이동 둔화 + 받는 피해 증가
    - 산호초: 스폰 밀도 증가
    - 대양: 해류/스폰 강화
    - 북극: 이동 둔화 + 받는 피해 증가 + 냉색 오버레이
- HUD/상태 출력 확장
  - HUD에 `맵 체감 강화: N초 남음` 표시
  - `render_game_to_text`에 `biomeImpactSec`, `skillState.biomeEffectStrength` 추가

## Validation
- `node --check game.js`: 통과 (2026-02-08, Update 8)
- Playwright 검증: `/tmp/growTheFish-5min-check`
  - 스크린샷 확인: HUD에 `맵 체감 강화: 300초 남음` 노출
  - 상태 JSON 확인: `biomeImpactSec: 299.7`, `biomeEffectStrength: 1` 확인

## Update 9
- 민물맵 해수어 분리
  - 강/늪지대에 민물종(송어/배스/메기/철갑상어/강꼬치고기/잉어/민물가재) 중심으로 재구성
  - 해수어(멸치/정어리/고등어/리프상어/문어/오징어/고래/바다거북/가재)는 민물맵 스폰에서 제외
- 물고기 선택 버튼 추가
  - 시작 화면에 플레이어 어종 3종 선택 버튼 UI 추가(마우스 클릭)
  - 기존 키보드 선택(1/2/3, [ ])은 유지

## Validation
- `node --check game.js`: 통과 (2026-02-08, Update 9)

## Update 10
- 추가 요청 반영
  - 신규 맵: `해변가맵(beach)` 추가
  - 신규 생물: `펭귄(penguin)` 추가 (`arctic`, `beach` 출현)
  - 가재류(가재/민물가재) 바닥 크롤링 로직 추가
    - 바닥(y/z) 근처 유지 + 수직 이동 억제 + 좌우 기어다니는 이동 보정
  - 수중 시각 현실감 보강
    - 해저 바닥 그라디언트 + 수중 빛무늬(caustics) 오버레이
- 기존 민물 분리와 선택 버튼 유지
  - 강/늪지대 해수어 제외
  - 시작 화면 물고기 선택 버튼 클릭 가능

## Validation
- `node --check game.js`: 통과 (2026-02-08, Update 10)
- Playwright 검증: `/tmp/growTheFish-penguin-check`
  - 시각 보강(해저/빛무늬) 확인
  - 상태 JSON에서 신규/수정 로직 필드 정상 출력 확인
