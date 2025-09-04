/**
 * UI 컴포넌트 및 인터랙션 기능
 * 
 * @author SDI Solution Driven Innovators
 * @version 1.0.0
 */

/**
 * 모달 컴포넌트
 */
class Modal {
  constructor(id, options = {}) {
    this.id = id;
    this.options = {
      backdrop: true,
      keyboard: true,
      focus: true,
      ...options
    };
    
    this.element = null;
    this.backdrop = null;
    this.isOpen = false;
    
    this.init();
  }
  
  init() {
    this.element = document.getElementById(this.id);
    if (!this.element) {
      console.error(`Modal with id "${this.id}" not found`);
      return;
    }
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // 닫기 버튼
    const closeButtons = this.element.querySelectorAll('[data-dismiss="modal"]');
    closeButtons.forEach(button => {
      button.addEventListener('click', () => this.close());
    });
    
    // 백드롭 클릭
    if (this.options.backdrop) {
      this.element.addEventListener('click', (e) => {
        if (e.target === this.element) {
          this.close();
        }
      });
    }
    
    // ESC 키
    if (this.options.keyboard) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });
    }
  }
  
  open() {
    if (!this.element) return;
    
    // 백드롭 생성
    if (this.options.backdrop) {
      this.backdrop = document.createElement('div');
      this.backdrop.className = 'modal-backdrop fade show';
      document.body.appendChild(this.backdrop);
    }
    
    // 모달 표시
    this.element.style.display = 'block';
    this.element.classList.add('show');
    document.body.classList.add('modal-open');
    
    this.isOpen = true;
    
    // 포커스 설정
    if (this.options.focus) {
      const focusableElement = this.element.querySelector('input, button, [tabindex]:not([tabindex="-1"])');
      if (focusableElement) {
        focusableElement.focus();
      }
    }
    
    // 이벤트 발생
    this.element.dispatchEvent(new CustomEvent('modal:opened'));
  }
  
  close() {
    if (!this.element || !this.isOpen) return;
    
    // 백드롭 제거
    if (this.backdrop) {
      this.backdrop.remove();
      this.backdrop = null;
    }
    
    // 모달 숨김
    this.element.classList.remove('show');
    document.body.classList.remove('modal-open');
    
    setTimeout(() => {
      this.element.style.display = 'none';
    }, 150);
    
    this.isOpen = false;
    
    // 이벤트 발생
    this.element.dispatchEvent(new CustomEvent('modal:closed'));
  }
}

/**
 * 토스트 알림 컴포넌트
 */
class Toast {
  constructor(message, type = 'info', duration = 3000) {
    this.message = message;
    this.type = type;
    this.duration = duration;
    this.element = null;
    
    this.create();
  }
  
  create() {
    this.element = document.createElement('div');
    this.element.className = `toast toast-${this.type} fade show`;
    this.element.innerHTML = `
      <div class="toast-header">
        <strong class="me-auto">알림</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
      </div>
      <div class="toast-body">
        ${this.message}
      </div>
    `;
    
    // 닫기 버튼 이벤트
    const closeButton = this.element.querySelector('.btn-close');
    closeButton.addEventListener('click', () => this.dismiss());
    
    // 컨테이너에 추가
    this.appendToContainer();
    
    // 자동 제거
    if (this.duration > 0) {
      setTimeout(() => this.dismiss(), this.duration);
    }
  }
  
  appendToContainer() {
    let container = document.querySelector('.toast-container');
    
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container position-fixed top-0 end-0 p-3';
      container.style.zIndex = '1055';
      document.body.appendChild(container);
    }
    
    container.appendChild(this.element);
  }
  
  dismiss() {
    if (this.element && this.element.parentNode) {
      this.element.classList.remove('show');
      setTimeout(() => {
        if (this.element.parentNode) {
          this.element.parentNode.removeChild(this.element);
        }
      }, 150);
    }
  }
}

/**
 * 로딩 스피너 컴포넌트
 */
class LoadingSpinner {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.options = {
      text: '로딩 중...',
      size: 'medium',
      overlay: false,
      ...options
    };
    
    this.element = null;
    this.isVisible = false;
  }
  
  show() {
    if (this.isVisible) return;
    
    this.element = document.createElement('div');
    this.element.className = `loading-spinner-container ${this.options.overlay ? 'overlay' : ''}`;
    
    const spinnerClass = this.getSpinnerClass();
    
    this.element.innerHTML = `
      <div class="spinner-content">
        <div class="${spinnerClass}" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        ${this.options.text ? `<p class="mt-2">${this.options.text}</p>` : ''}
      </div>
    `;
    
    if (this.options.overlay) {
      this.element.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      `;
      document.body.appendChild(this.element);
    } else {
      this.container.appendChild(this.element);
    }
    
    this.isVisible = true;
  }
  
  hide() {
    if (!this.isVisible || !this.element) return;
    
    if (this.options.overlay) {
      document.body.removeChild(this.element);
    } else {
      this.container.removeChild(this.element);
    }
    
    this.element = null;
    this.isVisible = false;
  }
  
  getSpinnerClass() {
    const sizeMap = {
      small: 'spinner-border spinner-border-sm',
      medium: 'spinner-border',
      large: 'spinner-border',
      extraLarge: 'spinner-border'
    };
    
    return sizeMap[this.options.size] || 'spinner-border';
  }
}

/**
 * 탭 컴포넌트
 */
class TabManager {
  constructor(container) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.tabs = [];
    this.activeTab = null;
    
    this.init();
  }
  
  init() {
    const tabButtons = this.container.querySelectorAll('[data-tab]');
    
    tabButtons.forEach(button => {
      const tabId = button.getAttribute('data-tab');
      const tabContent = document.querySelector(`[data-tab-content="${tabId}"]`);
      
      if (tabContent) {
        this.tabs.push({
          id: tabId,
          button: button,
          content: tabContent
        });
        
        button.addEventListener('click', () => this.showTab(tabId));
      }
    });
    
    // 첫 번째 탭 활성화
    if (this.tabs.length > 0) {
      this.showTab(this.tabs[0].id);
    }
  }
  
  showTab(tabId) {
    // 모든 탭 비활성화
    this.tabs.forEach(tab => {
      tab.button.classList.remove('active');
      tab.content.classList.remove('active');
    });
    
    // 선택된 탭 활성화
    const selectedTab = this.tabs.find(tab => tab.id === tabId);
    if (selectedTab) {
      selectedTab.button.classList.add('active');
      selectedTab.content.classList.add('active');
      this.activeTab = selectedTab;
    }
  }
}

/**
 * 아코디언 컴포넌트
 */
class Accordion {
  constructor(container) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.items = [];
    
    this.init();
  }
  
  init() {
    const accordionItems = this.container.querySelectorAll('[data-accordion-item]');
    
    accordionItems.forEach(item => {
      const trigger = item.querySelector('[data-accordion-trigger]');
      const content = item.querySelector('[data-accordion-content]');
      
      if (trigger && content) {
        this.items.push({
          item: item,
          trigger: trigger,
          content: content,
          isOpen: false
        });
        
        trigger.addEventListener('click', () => this.toggleItem(item));
      }
    });
  }
  
  toggleItem(itemElement) {
    const item = this.items.find(i => i.item === itemElement);
    if (!item) return;
    
    if (item.isOpen) {
      this.closeItem(item);
    } else {
      this.openItem(item);
    }
  }
  
  openItem(item) {
    // 다른 아이템들 닫기
    this.items.forEach(otherItem => {
      if (otherItem !== item && otherItem.isOpen) {
        this.closeItem(otherItem);
      }
    });
    
    item.item.classList.add('open');
    item.content.style.maxHeight = item.content.scrollHeight + 'px';
    item.isOpen = true;
  }
  
  closeItem(item) {
    item.item.classList.remove('open');
    item.content.style.maxHeight = '0';
    item.isOpen = false;
  }
}

/**
 * 툴팁 컴포넌트
 */
class Tooltip {
  constructor(element, options = {}) {
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    this.options = {
      title: '',
      placement: 'top',
      trigger: 'hover',
      ...options
    };
    
    this.tooltipElement = null;
    this.isVisible = false;
    
    this.init();
  }
  
  init() {
    if (!this.element) return;
    
    this.element.addEventListener('mouseenter', () => this.show());
    this.element.addEventListener('mouseleave', () => this.hide());
    this.element.addEventListener('focus', () => this.show());
    this.element.addEventListener('blur', () => this.hide());
  }
  
  show() {
    if (this.isVisible) return;
    
    this.tooltipElement = document.createElement('div');
    this.tooltipElement.className = 'tooltip show';
    this.tooltipElement.innerHTML = `
      <div class="tooltip-arrow"></div>
      <div class="tooltip-inner">${this.options.title}</div>
    `;
    
    document.body.appendChild(this.tooltipElement);
    
    this.position();
    this.isVisible = true;
  }
  
  hide() {
    if (!this.isVisible || !this.tooltipElement) return;
    
    this.tooltipElement.remove();
    this.tooltipElement = null;
    this.isVisible = false;
  }
  
  position() {
    const rect = this.element.getBoundingClientRect();
    const tooltipRect = this.tooltipElement.getBoundingClientRect();
    
    let top, left;
    
    switch (this.options.placement) {
      case 'top':
        top = rect.top - tooltipRect.height - 8;
        left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'bottom':
        top = rect.bottom + 8;
        left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
        left = rect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
        left = rect.right + 8;
        break;
    }
    
    this.tooltipElement.style.top = top + 'px';
    this.tooltipElement.style.left = left + 'px';
  }
}

/**
 * 드롭다운 컴포넌트
 */
class Dropdown {
  constructor(element, options = {}) {
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    this.options = {
      autoClose: true,
      ...options
    };
    
    this.menu = null;
    this.isOpen = false;
    
    this.init();
  }
  
  init() {
    if (!this.element) return;
    
    this.menu = this.element.querySelector('.dropdown-menu');
    if (!this.menu) return;
    
    const toggle = this.element.querySelector('[data-toggle="dropdown"]');
    if (toggle) {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggle();
      });
    }
    
    // 외부 클릭 시 닫기
    if (this.options.autoClose) {
      document.addEventListener('click', (e) => {
        if (!this.element.contains(e.target)) {
          this.close();
        }
      });
    }
  }
  
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  
  open() {
    this.menu.classList.add('show');
    this.element.classList.add('show');
    this.isOpen = true;
  }
  
  close() {
    this.menu.classList.remove('show');
    this.element.classList.remove('show');
    this.isOpen = false;
  }
}

/**
 * 스크롤 진행률 표시기
 */
class ScrollProgress {
  constructor(options = {}) {
    this.options = {
      color: '#ff0000',
      height: '3px',
      ...options
    };
    
    this.element = null;
    this.init();
  }
  
  init() {
    this.element = document.createElement('div');
    this.element.className = 'scroll-progress';
    this.element.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: ${this.options.height};
      background: ${this.options.color};
      z-index: 9999;
      transition: width 0.1s ease;
    `;
    
    document.body.appendChild(this.element);
    
    window.addEventListener('scroll', () => this.update());
    window.addEventListener('resize', () => this.update());
    
    this.update();
  }
  
  update() {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    this.element.style.width = scrollPercent + '%';
  }
  
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

/**
 * 애니메이션 유틸리티
 */
class AnimationUtils {
  static fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    let start = null;
    
    function animate(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const opacity = Math.min(progress / duration, 1);
      
      element.style.opacity = opacity;
      
      if (progress < duration) {
        requestAnimationFrame(animate);
      }
    }
    
    requestAnimationFrame(animate);
  }
  
  static fadeOut(element, duration = 300) {
    let start = null;
    const initialOpacity = parseFloat(getComputedStyle(element).opacity);
    
    function animate(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const opacity = Math.max(initialOpacity - (progress / duration), 0);
      
      element.style.opacity = opacity;
      
      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        element.style.display = 'none';
      }
    }
    
    requestAnimationFrame(animate);
  }
  
  static slideDown(element, duration = 300) {
    element.style.height = '0';
    element.style.overflow = 'hidden';
    element.style.display = 'block';
    
    const targetHeight = element.scrollHeight;
    let start = null;
    
    function animate(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const height = Math.min((progress / duration) * targetHeight, targetHeight);
      
      element.style.height = height + 'px';
      
      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        element.style.height = 'auto';
        element.style.overflow = '';
      }
    }
    
    requestAnimationFrame(animate);
  }
  
  static slideUp(element, duration = 300) {
    const targetHeight = element.scrollHeight;
    element.style.height = targetHeight + 'px';
    element.style.overflow = 'hidden';
    
    let start = null;
    
    function animate(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const height = Math.max(targetHeight - (progress / duration) * targetHeight, 0);
      
      element.style.height = height + 'px';
      
      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        element.style.display = 'none';
        element.style.height = '';
        element.style.overflow = '';
      }
    }
    
    requestAnimationFrame(animate);
  }
}

// 전역 함수로 노출
window.Modal = Modal;
window.Toast = Toast;
window.LoadingSpinner = LoadingSpinner;
window.TabManager = TabManager;
window.Accordion = Accordion;
window.Tooltip = Tooltip;
window.Dropdown = Dropdown;
window.ScrollProgress = ScrollProgress;
window.AnimationUtils = AnimationUtils;

// 페이지 로드 시 스크롤 진행률 표시기 초기화
document.addEventListener('DOMContentLoaded', () => {
  new ScrollProgress();
});
