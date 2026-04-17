# API 명세서 — 영업 일일 보고 시스템

## 목차

1. [개요](#1-개요)
2. [인증](#2-인증)
3. [공통 규칙](#3-공통-규칙)
4. [Auth API](#4-auth-api)
5. [Reports API](#5-reports-api)
6. [Comments API](#6-comments-api)
7. [Customers API](#7-customers-api)
8. [Users API](#8-users-api)

---

## 1. 개요

| 항목        | 내용                                    |
| ----------- | --------------------------------------- |
| Base URL    | `https://api.example.com/api/v1`        |
| 프로토콜    | HTTPS                                   |
| 데이터 형식 | JSON (`Content-Type: application/json`) |
| 인증 방식   | JWT Bearer Token                        |
| 문자 인코딩 | UTF-8                                   |

---

## 2. 인증

인증이 필요한 모든 요청에는 HTTP 헤더에 JWT 토큰을 포함해야 합니다.

```
Authorization: Bearer {access_token}
```

| 항목                   | 내용  |
| ---------------------- | ----- |
| Access Token 유효기간  | 2시간 |
| Refresh Token 유효기간 | 7일   |

---

## 3. 공통 규칙

### 3.1 공통 응답 형식

**성공**

```json
{
  "success": true,
  "data": { ... }
}
```

**목록 조회 (페이지네이션 포함)**

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

**실패**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값이 올바르지 않습니다.",
    "details": [{ "field": "report_date", "message": "날짜는 필수입니다." }]
  }
}
```

### 3.2 공통 에러 코드

| HTTP 상태 | 에러 코드          | 설명                                     |
| --------- | ------------------ | ---------------------------------------- |
| 400       | `VALIDATION_ERROR` | 요청 파라미터 유효성 오류                |
| 401       | `UNAUTHORIZED`     | 인증 토큰 없음 또는 만료                 |
| 403       | `FORBIDDEN`        | 권한 없음                                |
| 404       | `NOT_FOUND`        | 리소스 없음                              |
| 409       | `CONFLICT`         | 중복 데이터 (e.g. 동일 날짜 보고서 중복) |
| 500       | `INTERNAL_ERROR`   | 서버 내부 오류                           |

### 3.3 날짜/시간 형식

| 타입 | 형식         | 예시                   |
| ---- | ------------ | ---------------------- |
| 날짜 | `YYYY-MM-DD` | `2026-04-13`           |
| 일시 | ISO 8601 UTC | `2026-04-13T09:00:00Z` |

### 3.4 권한 약어

| 약어    | 역할      |
| ------- | --------- |
| SALES   | 영업 사원 |
| MANAGER | 상급자    |

---

## 4. Auth API

### POST `/auth/login`

로그인하여 JWT 토큰을 발급받습니다.

- **인증 불필요**

**Request Body**

```json
{
  "email": "hong@company.com",
  "password": "password1234"
}
```

| 필드     | 타입   | 필수 | 설명          |
| -------- | ------ | ---- | ------------- |
| email    | string | Y    | 사용자 이메일 |
| password | string | Y    | 비밀번호      |

**Response `200`**

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGci...",
    "refresh_token": "eyJhbGci...",
    "user": {
      "user_id": 1,
      "name": "홍길동",
      "email": "hong@company.com",
      "role": "SALES",
      "department": "영업1팀"
    }
  }
}
```

**Errors**

| 상태 | 코드               | 조건                        |
| ---- | ------------------ | --------------------------- |
| 400  | `VALIDATION_ERROR` | 필드 누락 또는 형식 오류    |
| 401  | `UNAUTHORIZED`     | 이메일 또는 비밀번호 불일치 |

---

### POST `/auth/refresh`

Refresh Token으로 새로운 Access Token을 발급받습니다.

- **인증 불필요**

**Request Body**

```json
{
  "refresh_token": "eyJhbGci..."
}
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGci..."
  }
}
```

---

### POST `/auth/logout`

로그아웃하여 Refresh Token을 무효화합니다.

- **인증 필요**

**Response `200`**

```json
{
  "success": true,
  "data": null
}
```

---

## 5. Reports API

### GET `/reports`

보고서 목록을 조회합니다.

- **인증 필요**
- **권한**: SALES (본인), MANAGER (전체)

**Query Parameters**

| 파라미터  | 타입    | 필수 | 설명                                                |
| --------- | ------- | ---- | --------------------------------------------------- |
| date_from | string  | N    | 검색 시작일 (`YYYY-MM-DD`). 기본값: 오늘 기준 -30일 |
| date_to   | string  | N    | 검색 종료일 (`YYYY-MM-DD`). 기본값: 오늘            |
| user_id   | integer | N    | 담당자 필터 (MANAGER만 사용 가능)                   |
| page      | integer | N    | 페이지 번호. 기본값: 1                              |
| per_page  | integer | N    | 페이지당 건수. 기본값: 20, 최대: 100                |

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "report_id": 1,
      "report_date": "2026-04-13",
      "user": {
        "user_id": 1,
        "name": "홍길동",
        "department": "영업1팀"
      },
      "visit_count": 3,
      "created_at": "2026-04-13T09:00:00Z",
      "updated_at": "2026-04-13T09:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

---

### POST `/reports`

보고서를 신규 작성합니다.

- **인증 필요**
- **권한**: SALES

**Request Body**

```json
{
  "report_date": "2026-04-13",
  "visits": [
    {
      "customer_id": 10,
      "content": "신규 제안서 제출 및 담당자 면담",
      "visit_time": "10:30"
    }
  ],
  "problems": [
    {
      "content": "삼성전자 견적 재검토 요청 대응 필요"
    }
  ],
  "plans": [
    {
      "content": "LG화학 계약서 초안 작성"
    }
  ]
}
```

| 필드                 | 타입    | 필수 | 설명                     |
| -------------------- | ------- | ---- | ------------------------ |
| report_date          | string  | Y    | 보고 날짜                |
| visits               | array   | Y    | 방문 기록 목록. 최소 1건 |
| visits[].customer_id | integer | Y    | 고객 마스터 ID           |
| visits[].content     | string  | Y    | 방문 내용                |
| visits[].visit_time  | string  | N    | 방문 시각 (`HH:MM`)      |
| problems             | array   | N    | 과제/상담 목록           |
| problems[].content   | string  | Y    | 과제/상담 내용           |
| plans                | array   | N    | 내일 할 일 목록          |
| plans[].content      | string  | Y    | 내일 할 일 내용          |

**Response `201`**

```json
{
  "success": true,
  "data": {
    "report_id": 42
  }
}
```

**Errors**

| 상태 | 코드               | 조건                          |
| ---- | ------------------ | ----------------------------- |
| 400  | `VALIDATION_ERROR` | 필수 필드 누락, 방문 기록 0건 |
| 404  | `NOT_FOUND`        | 존재하지 않는 customer_id     |
| 409  | `CONFLICT`         | 해당 날짜 보고서 중복         |

---

### GET `/reports/:report_id`

보고서 상세를 조회합니다.

- **인증 필요**
- **권한**: SALES (본인), MANAGER (전체)

**Path Parameters**

| 파라미터  | 타입    | 설명      |
| --------- | ------- | --------- |
| report_id | integer | 보고서 ID |

**Response `200`**

```json
{
  "success": true,
  "data": {
    "report_id": 42,
    "report_date": "2026-04-13",
    "user": {
      "user_id": 1,
      "name": "홍길동",
      "department": "영업1팀"
    },
    "visits": [
      {
        "visit_id": 101,
        "customer": {
          "customer_id": 10,
          "company_name": "(주)삼성전자",
          "contact_name": "김철수"
        },
        "content": "신규 제안서 제출 및 담당자 면담",
        "visit_time": "10:30"
      }
    ],
    "problems": [
      {
        "problem_id": 201,
        "content": "삼성전자 견적 재검토 요청 대응 필요",
        "comments": [
          {
            "comment_id": 301,
            "content": "견적팀에 확인 요청해 주세요",
            "author": {
              "user_id": 2,
              "name": "이부장"
            },
            "created_at": "2026-04-13T14:00:00Z"
          }
        ],
        "created_at": "2026-04-13T09:00:00Z"
      }
    ],
    "plans": [
      {
        "plan_id": 401,
        "content": "LG화학 계약서 초안 작성",
        "comments": [],
        "created_at": "2026-04-13T09:00:00Z"
      }
    ],
    "created_at": "2026-04-13T09:00:00Z",
    "updated_at": "2026-04-13T09:30:00Z"
  }
}
```

**Errors**

| 상태 | 코드        | 조건                          |
| ---- | ----------- | ----------------------------- |
| 403  | `FORBIDDEN` | SALES가 타인 보고서 조회 시도 |
| 404  | `NOT_FOUND` | 존재하지 않는 report_id       |

---

### PUT `/reports/:report_id`

보고서를 수정합니다. 방문 기록·Problem·Plan은 전체 교체(replace)합니다.

- **인증 필요**
- **권한**: SALES (본인만)

**Request Body**

POST `/reports`와 동일한 구조

**Response `200`**

```json
{
  "success": true,
  "data": {
    "report_id": 42
  }
}
```

**Errors**

| 상태 | 코드        | 조건                                     |
| ---- | ----------- | ---------------------------------------- |
| 403  | `FORBIDDEN` | 타인 보고서 수정 시도                    |
| 404  | `NOT_FOUND` | 존재하지 않는 report_id 또는 customer_id |

---

### DELETE `/reports/:report_id`

보고서를 삭제합니다. 연관된 방문 기록, Problem, Plan, 댓글이 함께 삭제됩니다.

- **인증 필요**
- **권한**: SALES (본인만)

**Response `200`**

```json
{
  "success": true,
  "data": null
}
```

**Errors**

| 상태 | 코드        | 조건                    |
| ---- | ----------- | ----------------------- |
| 403  | `FORBIDDEN` | 타인 보고서 삭제 시도   |
| 404  | `NOT_FOUND` | 존재하지 않는 report_id |

---

## 6. Comments API

댓글은 Problem 또는 Plan에 귀속됩니다.

### POST `/problems/:problem_id/comments`

Problem 항목에 댓글을 등록합니다.

- **인증 필요**
- **권한**: MANAGER

**Path Parameters**

| 파라미터   | 타입    | 설명       |
| ---------- | ------- | ---------- |
| problem_id | integer | Problem ID |

**Request Body**

```json
{
  "content": "견적팀에 확인 요청해 주세요"
}
```

| 필드    | 타입   | 필수 | 설명      |
| ------- | ------ | ---- | --------- |
| content | string | Y    | 댓글 내용 |

**Response `201`**

```json
{
  "success": true,
  "data": {
    "comment_id": 301,
    "content": "견적팀에 확인 요청해 주세요",
    "author": {
      "user_id": 2,
      "name": "이부장"
    },
    "created_at": "2026-04-13T14:00:00Z"
  }
}
```

**Errors**

| 상태 | 코드        | 조건                     |
| ---- | ----------- | ------------------------ |
| 403  | `FORBIDDEN` | SALES가 댓글 등록 시도   |
| 404  | `NOT_FOUND` | 존재하지 않는 problem_id |

---

### POST `/plans/:plan_id/comments`

Plan 항목에 댓글을 등록합니다.

- **인증 필요**
- **권한**: MANAGER

**Path Parameters**

| 파라미터 | 타입    | 설명    |
| -------- | ------- | ------- |
| plan_id  | integer | Plan ID |

**Request Body / Response**

`POST /problems/:problem_id/comments` 와 동일한 구조

---

### DELETE `/comments/:comment_id`

댓글을 삭제합니다.

- **인증 필요**
- **권한**: MANAGER (본인 댓글만)

**Path Parameters**

| 파라미터   | 타입    | 설명    |
| ---------- | ------- | ------- |
| comment_id | integer | 댓글 ID |

**Response `200`**

```json
{
  "success": true,
  "data": null
}
```

**Errors**

| 상태 | 코드        | 조건                     |
| ---- | ----------- | ------------------------ |
| 403  | `FORBIDDEN` | 타인 댓글 삭제 시도      |
| 404  | `NOT_FOUND` | 존재하지 않는 comment_id |

---

## 7. Customers API

### GET `/customers`

고객 목록을 조회합니다.

- **인증 필요**
- **권한**: SALES, MANAGER

**Query Parameters**

| 파라미터 | 타입    | 필수 | 설명                                 |
| -------- | ------- | ---- | ------------------------------------ |
| q        | string  | N    | 고객사명 또는 담당자명 부분 검색     |
| industry | string  | N    | 업종 필터                            |
| page     | integer | N    | 페이지 번호. 기본값: 1               |
| per_page | integer | N    | 페이지당 건수. 기본값: 20, 최대: 100 |

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "customer_id": 10,
      "company_name": "(주)삼성전자",
      "contact_name": "김철수",
      "phone": "010-1234-5678",
      "address": "서울시 서초구",
      "industry": "전자",
      "created_at": "2026-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 50,
    "total_pages": 3
  }
}
```

---

### POST `/customers`

고객을 등록합니다.

- **인증 필요**
- **권한**: MANAGER

**Request Body**

```json
{
  "company_name": "(주)삼성전자",
  "contact_name": "김철수",
  "phone": "010-1234-5678",
  "address": "서울시 서초구",
  "industry": "전자"
}
```

| 필드         | 타입   | 필수 | 설명     |
| ------------ | ------ | ---- | -------- |
| company_name | string | Y    | 고객사명 |
| contact_name | string | N    | 담당자명 |
| phone        | string | N    | 연락처   |
| address      | string | N    | 주소     |
| industry     | string | N    | 업종     |

**Response `201`**

```json
{
  "success": true,
  "data": {
    "customer_id": 10
  }
}
```

**Errors**

| 상태 | 코드               | 조건               |
| ---- | ------------------ | ------------------ |
| 400  | `VALIDATION_ERROR` | company_name 누락  |
| 403  | `FORBIDDEN`        | SALES가 등록 시도  |
| 409  | `CONFLICT`         | 동일 고객사명 중복 |

---

### GET `/customers/:customer_id`

고객 상세를 조회합니다.

- **인증 필요**
- **권한**: SALES, MANAGER

**Response `200`**

```json
{
  "success": true,
  "data": {
    "customer_id": 10,
    "company_name": "(주)삼성전자",
    "contact_name": "김철수",
    "phone": "010-1234-5678",
    "address": "서울시 서초구",
    "industry": "전자",
    "created_at": "2026-01-01T00:00:00Z"
  }
}
```

---

### PUT `/customers/:customer_id`

고객 정보를 수정합니다.

- **인증 필요**
- **권한**: MANAGER

**Request Body**

POST `/customers`와 동일한 구조

**Response `200`**

```json
{
  "success": true,
  "data": {
    "customer_id": 10
  }
}
```

---

### DELETE `/customers/:customer_id`

고객을 삭제합니다.

- **인증 필요**
- **권한**: MANAGER

> **주의**: 방문 기록에서 참조 중인 고객은 삭제할 수 없습니다.

**Response `200`**

```json
{
  "success": true,
  "data": null
}
```

**Errors**

| 상태 | 코드        | 조건                      |
| ---- | ----------- | ------------------------- |
| 403  | `FORBIDDEN` | SALES가 삭제 시도         |
| 404  | `NOT_FOUND` | 존재하지 않는 customer_id |
| 409  | `CONFLICT`  | 방문 기록에서 참조 중     |

---

## 8. Users API

### GET `/users`

사용자 목록을 조회합니다.

- **인증 필요**
- **권한**: MANAGER

**Query Parameters**

| 파라미터 | 타입    | 필수 | 설명                                 |
| -------- | ------- | ---- | ------------------------------------ |
| q        | string  | N    | 이름 또는 이메일 부분 검색           |
| role     | string  | N    | 역할 필터 (`SALES` \| `MANAGER`)     |
| page     | integer | N    | 페이지 번호. 기본값: 1               |
| per_page | integer | N    | 페이지당 건수. 기본값: 20, 최대: 100 |

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "user_id": 1,
      "name": "홍길동",
      "email": "hong@company.com",
      "department": "영업1팀",
      "role": "SALES",
      "created_at": "2026-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 10,
    "total_pages": 1
  }
}
```

---

### POST `/users`

사용자를 등록합니다.

- **인증 필요**
- **권한**: MANAGER

**Request Body**

```json
{
  "name": "홍길동",
  "email": "hong@company.com",
  "password": "password1234",
  "department": "영업1팀",
  "role": "SALES"
}
```

| 필드       | 타입   | 필수 | 설명                          |
| ---------- | ------ | ---- | ----------------------------- |
| name       | string | Y    | 사용자 이름                   |
| email      | string | Y    | 이메일 (로그인 ID). 수정 불가 |
| password   | string | Y    | 비밀번호. 8자 이상            |
| department | string | N    | 소속 팀/부서                  |
| role       | string | Y    | `SALES` 또는 `MANAGER`        |

**Response `201`**

```json
{
  "success": true,
  "data": {
    "user_id": 1
  }
}
```

**Errors**

| 상태 | 코드               | 조건                              |
| ---- | ------------------ | --------------------------------- |
| 400  | `VALIDATION_ERROR` | 필수 필드 누락, 비밀번호 8자 미만 |
| 403  | `FORBIDDEN`        | SALES가 등록 시도                 |
| 409  | `CONFLICT`         | 동일 이메일 중복                  |

---

### GET `/users/:user_id`

사용자 상세를 조회합니다.

- **인증 필요**
- **권한**: MANAGER

**Response `200`**

```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "name": "홍길동",
    "email": "hong@company.com",
    "department": "영업1팀",
    "role": "SALES",
    "created_at": "2026-01-01T00:00:00Z"
  }
}
```

---

### PUT `/users/:user_id`

사용자 정보를 수정합니다. 이메일은 변경할 수 없습니다.

- **인증 필요**
- **권한**: MANAGER

**Request Body**

```json
{
  "name": "홍길동",
  "department": "영업2팀",
  "role": "MANAGER"
}
```

| 필드       | 타입   | 필수 | 설명                   |
| ---------- | ------ | ---- | ---------------------- |
| name       | string | Y    | 사용자 이름            |
| department | string | N    | 소속 팀/부서           |
| role       | string | Y    | `SALES` 또는 `MANAGER` |

**Response `200`**

```json
{
  "success": true,
  "data": {
    "user_id": 1
  }
}
```

---

### DELETE `/users/:user_id`

사용자를 삭제합니다.

- **인증 필요**
- **권한**: MANAGER

**Response `200`**

```json
{
  "success": true,
  "data": null
}
```

---

## API 엔드포인트 요약

| 메서드 | 엔드포인트                       | 설명              | 권한                 |
| ------ | -------------------------------- | ----------------- | -------------------- |
| POST   | `/auth/login`                    | 로그인            | 전체                 |
| POST   | `/auth/refresh`                  | 토큰 갱신         | 전체                 |
| POST   | `/auth/logout`                   | 로그아웃          | 인증                 |
| GET    | `/reports`                       | 보고서 목록       | SALES, MANAGER       |
| POST   | `/reports`                       | 보고서 작성       | SALES                |
| GET    | `/reports/:report_id`            | 보고서 상세       | SALES(본인), MANAGER |
| PUT    | `/reports/:report_id`            | 보고서 수정       | SALES(본인)          |
| DELETE | `/reports/:report_id`            | 보고서 삭제       | SALES(본인)          |
| POST   | `/problems/:problem_id/comments` | Problem 댓글 등록 | MANAGER              |
| POST   | `/plans/:plan_id/comments`       | Plan 댓글 등록    | MANAGER              |
| DELETE | `/comments/:comment_id`          | 댓글 삭제         | MANAGER(본인)        |
| GET    | `/customers`                     | 고객 목록         | SALES, MANAGER       |
| POST   | `/customers`                     | 고객 등록         | MANAGER              |
| GET    | `/customers/:customer_id`        | 고객 상세         | SALES, MANAGER       |
| PUT    | `/customers/:customer_id`        | 고객 수정         | MANAGER              |
| DELETE | `/customers/:customer_id`        | 고객 삭제         | MANAGER              |
| GET    | `/users`                         | 사용자 목록       | MANAGER              |
| POST   | `/users`                         | 사용자 등록       | MANAGER              |
| GET    | `/users/:user_id`                | 사용자 상세       | MANAGER              |
| PUT    | `/users/:user_id`                | 사용자 수정       | MANAGER              |
| DELETE | `/users/:user_id`                | 사용자 삭제       | MANAGER              |
