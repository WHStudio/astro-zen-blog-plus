// 处理外部链接在新标签页打开
const handleExternalLinks = () => {
  // 获取当前域名
  const currentDomain = window.location.hostname;
  
  // 获取所有链接
  const links = document.querySelectorAll('a[href]');
  
  links.forEach((link) => {
    const href = link.getAttribute('href');
    
    // 跳过空链接、锚点链接、javascript链接等
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return;
    }
    
    try {
      // 检查是否为外部链接
      if (href.startsWith('http://') || href.startsWith('https://')) {
        const url = new URL(href);
        if (url.hostname !== currentDomain) {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        }
      }
    } catch (error) {
      console.warn('Invalid URL:', href);
    }
  });
};

document.addEventListener('astro:page-load', handleExternalLinks);
document.addEventListener('astro:after-swap', handleExternalLinks);
document.addEventListener('DOMContentLoaded', handleExternalLinks);
