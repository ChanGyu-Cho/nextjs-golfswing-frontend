# Metrics Graph Guidelines

## ⚠️ 목적

이 가이드는 모든 metrics 그래프 컴포넌트를 구현할 때 따라야 할 표준입니다.

---

## 1. 데이터 범위 제한 (Data Range Limitation)

### 문제 상황
전체 프레임 데이터를 그래프에 표시하면, 사용자가 의도치 않은 분석이 포함됩니다:
- 임팩트 이후의 휴식 동작 (follow-through)
- 백그라운드 노이즈 데이터
- 스윙 분석과 무관한 정보

### 예시
```
전체 프레임: 0 ~ 122 (총 122 프레임)
Impact Frame: 39
문제: 임팩트 이후 83 프레임이 모두 표시됨 → 노이즈 포함

해결책: 0 ~ 78 프레임만 표시 (임팩트까지의 데이터 × 2)
```

### 해결책: (0 ~ impact_frame) × 2 범위 제한

**동작 원리:**
- Impact Frame까지의 데이터 길이를 계산: `(impact_frame + 1)`
- 그 길이의 2배까지만 그래프에 표시
- 예: `impact_frame = 39` → `maxDataIndex = 79` → 그래프 범위: `0 ~ 78`

**코드 구현:**
```typescript
function limitDataRange(data: number[], impactFrame: number | null): number[] {
  if (impactFrame === null || data.length === 0) {
    return data;
  }
  
  // (0 ~ impact_frame) × 2 범위 계산
  const maxIndex = Math.min((impactFrame + 1) * 2 - 1, data.length - 1);
  return data.slice(0, maxIndex + 1);
}
```

### 왜 × 2인가?
- Test 추론에서는 10 clips로 노이즈 분리 가능
- 하지만 전체 그래프는 이미 노이즈 포함
- × 2 범위: 백스윙 시작 ~ 임팩트 이후 조금의 follow-through 포함
- 사용자의 의도된 스윙 동작을 최대한 포함하면서 노이즈 최소화

---

## 2. Impact Frame 마커 구현

모든 그래프에는 **Impact Frame을 명확하게 표시**해야 합니다.

### 시각적 표현
```
[빨간 수직선]
- 전체 그래프를 관통하는 점선
- strokeDasharray="5,5"
- 색상: #dc2626 (다크모드: #ef4444)

[원형 마커]
- Impact 지점에 원 표시
- 반지름: 5px
- 빈 원 (stroke만)

[레이블 박스]
- 빨간 배경 박스
- "Impact" 텍스트
- "Frame {number}" 텍스트
```

### 구현 예시 (XfactorGraph.tsx 참고)
```tsx
{impactFrame !== null && impactX !== null && impactFrame < data.length && (
  <>
    {/* Vertical red line */}
    <line
      x1={impactX}
      y1={padTop}
      x2={impactX}
      y2={height - padBottom}
      stroke="#dc2626"
      strokeWidth={2.5}
      strokeDasharray="5,5"
      className="dark:stroke-red-500"
      opacity={0.8}
    />

    {/* Impact point circle */}
    <circle
      cx={impactX}
      cy={padTop + graphHeight - ((data[impactFrame] - min) / range) * graphHeight}
      r={5}
      fill="none"
      stroke="#dc2626"
      strokeWidth={2.5}
      className="dark:stroke-red-500"
    />

    {/* Label Box */}
    <g>
      <rect
        x={impactX - 35}
        y={padTop - 30}
        width={70}
        height={24}
        fill="#dc2626"
        rx={4}
        className="dark:fill-red-600"
      />
      <text x={impactX} y={padTop - 12} textAnchor="middle" className="text-xs font-bold fill-white">
        Impact
      </text>
      <text x={impactX} y={padTop - 1} textAnchor="middle" className="text-xs fill-white">
        Frame {impactFrame}
      </text>
    </g>
  </>
)}
```

---

## 3. 다른 Metrics에 적용하는 방법

### 각 metric별 구현 체크리스트

#### a) COM Speed / COM Shift
- **파일:** `COMPanel.tsx`
- **데이터 위치:** `parsedJson.metrics.com_speed.metrics_data` 또는 `metrics.com_shift`
- **Impact Frame:** `parsedJson.metrics.com_speed.summary.impact_frame`
- **그래프:** `LineGraph` → `COMSpeedGraph` 변경 추천
- **Y축 단위:** mm/s 또는 %

#### b) Swing Speed
- **파일:** `SwingPanel.tsx`
- **데이터 위치:** `parsedJson.metrics.swing_speed.metrics_data`
- **Impact Frame:** `parsedJson.metrics.swing_speed.summary.impact_frame`
- **새 그래프:** `SwingSpeedGraph` 컴포넌트 생성
- **Y축 단위:** km/h

#### c) Head Speed
- **파일:** `HeadPanel.tsx`
- **데이터 위치:** `parsedJson.metrics.head_speed.frame_data`
- **Impact Frame:** `parsedJson.metrics.head_speed.summary.impact_frame`
- **새 그래프:** `HeadSpeedGraph` 컴포넌트 생성
- **Y축 단위:** mm/s 또는 %

#### d) Shoulder Sway
- **파일:** `ShoulderOverlay.tsx` (또는 전용 패널)
- **데이터 위치:** `parsedJson.metrics.shoulder_sway.metrics_data`
- **Impact Frame:** `parsedJson.impact_frame` (상위 레벨)
- **새 그래프:** `ShoulderSwayGraph` 컴포넌트 생성
- **Y축 단위:** 도(degree) 또는 mm

---

## 4. 구현 5단계 절차

### Step 1: 데이터 추출 함수 작성 (Panel에서)

```typescript
function extractMetricTimeseries(
  metric: any,
  impactFrame: number | null | undefined
): { data: number[]; impactIndex: number | null } {
  let data: number[] = [];
  let impactIndex: number | null = typeof impactFrame === "number" ? impactFrame : null;
  
  // 1. 데이터 추출 (각 metric의 구조에 맞게)
  if (metric?.metrics_data) {
    const keys = Object.keys(metric.metrics_data || {});
    if (keys.length > 0) {
      const seriesObj = metric.metrics_data[keys[0]];
      // ... 파싱 로직
    }
  }
  
  // 2. 범위 제한 적용 (항상 동일)
  const maxIndex = Math.min((impactIndex + 1) * 2 - 1, data.length - 1);
  data = data.slice(0, maxIndex + 1);
  
  return { data, impactIndex };
}
```

### Step 2: Graph 컴포넌트 생성

- SVG 기반 그래프 작성
- X축: Frame 번호
- Y축: 각 metric의 단위
- 그리드라인 및 레이블 포함

### Step 3: Impact Frame 마커 추가

```tsx
// Graph 컴포넌트에서 Impact 표시 (위의 "Impact Frame 마커 구현" 참고)
```

### Step 4: Panel에서 Graph에 props 전달

```tsx
<MetricGraph
  data={timeseriesData}
  impactFrame={impactIndex}
  width={800}
  height={300}
/>
```

### Step 5: 다크모드 지원 확인

- 모든 색상에 `dark:` 클래스 추가
- 배경, 텍스트, 라인 등 모두 확인

---

## 5. 추가 고려사항

### 필수 구현
- ✅ 범위 제한 적용
- ✅ Impact Frame 마커
- ✅ 다크모드 지원
- ✅ 그리드라인
- ✅ X축/Y축 레이블
- ✅ 적절한 단위 표시

### 선택사항
- 마우스 호버 시 데이터 값 표시
- 확대/축소 기능
- 데이터 다운로드 버튼

---

## 6. 참고 구현

**이미 구현된 컴포넌트:**
- `XfactorPanel.tsx`: 데이터 추출 및 범위 제한 로직
- `XfactorGraph.tsx`: SVG 기반 그래프 + Impact Frame 마커

이들을 참고하여 다른 metrics도 동일한 패턴으로 구현하세요.

---

## 7. 삭제 절차

이 가이드 파일이 필요 없어지면 다음 파일을 삭제하세요:
- `/home/ubuntu/nextjs-golfswing-frontend/METRICS_GRAPH_GUIDELINES.md`
