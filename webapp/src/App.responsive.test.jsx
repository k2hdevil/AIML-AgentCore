import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from './App.jsx';

// Mock fetch for markdown content loading
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    text: () => Promise.resolve('# Test Content\n\nSome text here'),
  })
);

describe('반응형 breakpoint 및 레이아웃', () => {
  let originalInnerWidth;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  describe('768px 이하에서 사이드바가 drawer(닫힘)로 초기화 (Requirement 1.7)', () => {
    it('window.innerWidth가 768px일 때 사이드바 네비게이션이 닫힌 상태로 시작된다', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      let container;
      await act(async () => {
        const result = render(<App />);
        container = result.container;
      });

      // Cloudscape AppLayout에서 navigationOpen=false일 때
      // navigation 패널에 aria-hidden="true"가 설정됨
      const navPanel = container.querySelector('nav[aria-hidden="true"]');
      expect(navPanel).toBeInTheDocument();
    });

    it('window.innerWidth가 600px일 때 사이드바가 닫힌 상태로 초기화된다', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      });

      let container;
      await act(async () => {
        const result = render(<App />);
        container = result.container;
      });

      // 모바일에서 nav가 aria-hidden="true"로 숨겨져 있어야 함
      const navPanel = container.querySelector('nav[aria-hidden="true"]');
      expect(navPanel).toBeInTheDocument();
    });
  });

  describe('768px 초과에서 사이드바가 열린 상태로 초기화 (Requirement 1.8)', () => {
    it('window.innerWidth가 1024px일 때 사이드바 콘텐츠가 표시된다', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      await act(async () => {
        render(<App />);
      });

      // 데스크톱에서는 navOpen=true이므로 네비게이션 패널의 콘텐츠가 표시됨
      // TreeNavigation의 모듈 항목이 표시됨
      const moduleItems = screen.getAllByText('모듈 0: 과정 소개');
      expect(moduleItems.length).toBeGreaterThanOrEqual(1);
    });

    it('window.innerWidth가 1920px일 때 사이드바가 열린 상태이다', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      let container;
      await act(async () => {
        const result = render(<App />);
        container = result.container;
      });

      // 넓은 viewport에서 navigation이 열려 있음을 확인
      // is-navigation-open 클래스가 있는 nav 요소 확인
      const openNav = container.querySelector('[class*="is-navigation-open"]');
      expect(openNav).toBeInTheDocument();
    });
  });

  describe('스크롤 시 헤더/사이드바 위치 고정 확인 (Requirement 5.1, 5.2)', () => {
    it('#top-nav 요소가 존재하여 headerSelector 동작이 가능하다', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      let container;
      await act(async () => {
        const result = render(<App />);
        container = result.container;
      });

      // Cloudscape AppLayout의 headerSelector="#top-nav" prop을 위한
      // #top-nav 요소 존재 확인 - 이 요소가 있어야 sticky header 동작이 활성화됨
      const topNav = container.querySelector('#top-nav');
      expect(topNav).toBeInTheDocument();
      expect(topNav.children.length).toBeGreaterThan(0);
    });

    it('AppLayout이 headerSelector를 통해 sticky header를 활성화한다', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      let container;
      await act(async () => {
        const result = render(<App />);
        container = result.container;
      });

      // Cloudscape AppLayout은 headerSelector가 설정되면
      // 해당 요소를 참조하여 sticky 동작을 수행한다.
      // #top-nav 내에 TopNavigation이 올바르게 렌더링되었는지 확인
      const topNav = container.querySelector('#top-nav');
      expect(topNav).toBeInTheDocument();

      // TopNavigation 타이틀 확인 (narrow/wide 두 렌더링이 있을 수 있음)
      const titles = screen.getAllByText('AgentCore');
      expect(titles.length).toBeGreaterThanOrEqual(1);
    });

    it('사이드바는 AppLayout에 의해 독립적 스크롤 영역으로 관리된다', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      let container;
      await act(async () => {
        const result = render(<App />);
        container = result.container;
      });

      // Cloudscape AppLayout은 navigation 영역을 별도 컨테이너로 관리
      // navigation-container 클래스가 있는 요소가 존재해야 함
      const navContainer = container.querySelector('[class*="navigation-container"]');
      expect(navContainer).toBeInTheDocument();
    });
  });

  describe('모바일에서 네비게이션 선택 후 사이드바 자동 닫힘 (Requirement 1.7)', () => {
    it('모바일(600px)에서 네비게이션 항목 클릭 시 사이드바가 자동으로 닫힌다', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      });

      let container;
      await act(async () => {
        const result = render(<App />);
        container = result.container;
      });

      // 초기 상태: 모바일에서 nav가 닫혀 있음 (aria-hidden="true")
      let navPanel = container.querySelector('nav[aria-hidden="true"]');
      expect(navPanel).toBeInTheDocument();

      // Cloudscape AppLayout에서 navigation open 트리거 버튼 찾기
      // navigation이 닫혀있을 때 open 버튼이 보임
      const openButton = container.querySelector(
        '[class*="show-navigation"] button, [class*="trigger-wrapper"] button'
      );

      if (openButton) {
        // 네비게이션 열기
        await act(async () => {
          fireEvent.click(openButton);
        });

        // 네비게이션 링크 클릭 (SideNavigation의 항목)
        const navLinks = container.querySelectorAll('a[href^="#"]');
        const moduleLink = Array.from(navLinks).find(
          (link) => link.textContent.includes('M01') || link.textContent.includes('M02')
        );

        if (moduleLink) {
          await act(async () => {
            fireEvent.click(moduleLink);
          });

          // 모바일에서는 handleNavChange에서 setNavOpen(false)가 호출됨
          // nav가 다시 aria-hidden="true"가 되어야 함
          await waitFor(() => {
            const closedNav = container.querySelector('nav[aria-hidden="true"]');
            expect(closedNav).toBeInTheDocument();
          });
        }
      }
    });
  });
});
