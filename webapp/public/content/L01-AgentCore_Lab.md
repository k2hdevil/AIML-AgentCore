# Lab 1: AgentCore 기본 설정 및 라이브러리 임포트

## 개요

이 셀은 Amazon Bedrock AgentCore 기반의 AI 에이전트를 구축하기 위한 필수 라이브러리를 임포트하고 초기 설정을 수행합니다.

## 코드

```python
import boto3
import json
import uuid
import time
import requests
from boto3.session import Session

# AgentCore imports
from bedrock_agentcore.memory import MemoryClient
from bedrock_agentcore.memory.constants import StrategyType

# Strands imports
from strands import Agent
from strands.models import BedrockModel
from strands.tools.mcp import MCPClient
from strands.hooks import AfterInvocationEvent, HookProvider, HookRegistry, MessageAddedEvent
from mcp.client.streamable_http import streamablehttp_client

# Local tools
from lab_helpers.lab1_strands_agent import (
    get_product_info, get_return_policy, get_technical_support, web_search,
    SYSTEM_PROMPT, MODEL_ID
)
from lab_helpers.utils import get_ssm_parameter, put_ssm_parameter
from scripts.utils import get_cognito_client_secret

# Setup
boto_session = Session()
REGION = boto_session.region_name
CUSTOMER_ID = "customer_001"
SESSION_ID = str(uuid.uuid4())

print("✅ Libraries imported successfully!")
```

## 코드 설명

### 1. 기본 라이브러리

| 라이브러리 | 용도 |
|---|---|
| `boto3` | AWS SDK for Python - AWS 서비스와 상호작용 |
| `json` | JSON 데이터 직렬화/역직렬화 |
| `uuid` | 고유 세션 ID 생성 |
| `time` | 시간 관련 유틸리티 |
| `requests` | HTTP 요청 처리 |

### 2. AgentCore 관련 임포트

- **`MemoryClient`**: AgentCore의 메모리 서비스 클라이언트로, 에이전트가 대화 이력이나 컨텍스트를 저장하고 검색할 수 있게 합니다.
- **`StrategyType`**: 메모리 저장 전략을 정의하는 상수입니다 (예: 요약, 전체 저장 등).

### 3. Strands 프레임워크 임포트

- **`Agent`**: Strands 에이전트의 핵심 클래스로, AI 에이전트를 생성하고 실행합니다.
- **`BedrockModel`**: Amazon Bedrock의 FM(Foundation Model)을 Strands 에이전트에서 사용할 수 있도록 래핑합니다.
- **`MCPClient`**: Model Context Protocol 클라이언트로, 외부 도구 서버와 통신합니다.
- **`HookProvider`, `HookRegistry`, 이벤트 클래스들**: 에이전트 실행 라이프사이클에 커스텀 로직을 주입하기 위한 훅 시스템입니다.
- **`streamablehttp_client`**: MCP 서버와 HTTP 기반 스트리밍 연결을 설정합니다.

### 4. 로컬 도구 (Local Tools)

- **`get_product_info`**: 제품 정보를 조회하는 도구
- **`get_return_policy`**: 반품 정책을 확인하는 도구
- **`get_technical_support`**: 기술 지원 정보를 제공하는 도구
- **`web_search`**: 웹 검색을 수행하는 도구
- **`SYSTEM_PROMPT`**: 에이전트의 시스템 프롬프트
- **`MODEL_ID`**: 사용할 Bedrock 모델 ID

### 5. 유틸리티

- **`get_ssm_parameter` / `put_ssm_parameter`**: AWS Systems Manager Parameter Store에서 파라미터를 읽고 쓰는 헬퍼 함수
- **`get_cognito_client_secret`**: Amazon Cognito 클라이언트 시크릿을 가져오는 함수 (인증 용도)

### 6. 초기 설정

- **`boto_session`**: 현재 AWS 자격증명과 리전 설정을 가진 세션 생성
- **`REGION`**: 현재 AWS 리전 자동 감지
- **`CUSTOMER_ID`**: 테스트용 고객 식별자 (`"customer_001"`)
- **`SESSION_ID`**: 매 실행마다 고유한 세션 ID 생성 (UUID v4)
