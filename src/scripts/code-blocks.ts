// 复制代码到剪贴板
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } 
  } catch (err) {
    console.error('复制失败:', err);
    return false;
  }
}

// 创建复制按钮
function createCopyButton(codeText: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.className = 'code-copy-btn';
  button.innerHTML = `
    <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
    </svg>
    <span class="copy-text">复制</span>
  `;
  
  button.addEventListener('click', async (e) => {
    e.preventDefault();
    const success = await copyToClipboard(codeText);
    
    if (success) {
      // 显示复制成功状态
      button.innerHTML = `
        <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
        </svg>
        <span class="copy-text">已复制</span>
      `;
      button.classList.add('copied');
      
      // 3秒后恢复原状
      setTimeout(() => {
        button.innerHTML = `
          <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
          </svg>
          <span class="copy-text">复制</span>
        `;
        button.classList.remove('copied');
      }, 3000);
    } else {
      // 显示复制失败状态
      button.innerHTML = `
        <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
        </svg>
        <span class="copy-text">复制失败</span>
      `;
      
      setTimeout(() => {
        button.innerHTML = `
          <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
          </svg>
          <span class="copy-text">复制</span>
        `;
      }, 3000);
    }
  });
  
  return button;
}

// 创建代码块头部
function createCodeHeader(language: string, codeText: string): HTMLElement {
  const header = document.createElement('div');
  header.className = 'code-block-header';
  
  const languageLabel = document.createElement('span');
  languageLabel.className = 'code-language';
  languageLabel.textContent = language || 'text';
  
  const copyButton = createCopyButton(codeText);
  
  header.appendChild(languageLabel);
  header.appendChild(copyButton);
  
  return header;
}

// 获取代码块的语言信息
function getLanguageFromCodeBlock(pre: HTMLElement): string {
  // rehype-pretty-code 会在 pre 元素上设置 data-language 属性
  const dataLang = pre.getAttribute('data-language');
  if (dataLang) return dataLang;
  
  return '';
}

// 增强代码块
function enhanceCodeBlocks(): void {
  // 查找所有可能的代码块结构
  const preElements = document.querySelectorAll('pre');
  
  preElements.forEach((pre) => {
    // 避免重复处理
    if (pre.closest('.code-block-wrapper')) {
      return;
    }
    
    // 检查是否包含代码内容
    const codeElement = pre.querySelector('code');
    if (!codeElement) return;
    
    const language = getLanguageFromCodeBlock(pre as HTMLElement);
    const codeText = codeElement.textContent || '';
    
    // 跳过空的代码块
    if (!codeText.trim()) return;
    
    // 创建容器包装代码块
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block-wrapper';
    
    // 创建头部
    const header = createCodeHeader(language, codeText);
    
    // 将代码块移到容器中
    const parent = pre.parentNode;
    if (parent) {
      parent.insertBefore(wrapper, pre);
      wrapper.appendChild(header);
      wrapper.appendChild(pre);
      
      // 添加样式类到pre元素
      pre.classList.add('enhanced-code-block');
    }
  });
}

// 初始化
function initCodeBlocks(): void {
  // DOM加载完成后立即运行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceCodeBlocks);
  } else {
    enhanceCodeBlocks();
  }
  
  // 监听页面变化（用于SPA路由）
  if ('onpopstate' in window) {
    window.addEventListener('popstate', () => {
      setTimeout(enhanceCodeBlocks, 100);
    });
  }
  
  // 监听view transition（Astro的页面转换）
  document.addEventListener('astro:page-load', enhanceCodeBlocks);
}

// 导出函数供其他脚本使用
export { enhanceCodeBlocks, initCodeBlocks };

// 自动初始化
initCodeBlocks();
