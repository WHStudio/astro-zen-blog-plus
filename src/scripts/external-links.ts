const handleExternalLinks = () => {
  const currentDomain = window.location.hostname;
  const links = document.querySelectorAll('a[href]');

  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return;
    }

    try {
      if (href.startsWith('http://') || href.startsWith('https://')) {
        const url = new URL(href);
        if (url.hostname !== currentDomain) {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        }
      }
    } catch {
      console.warn('Invalid URL:', href);
    }
  });
};

document.addEventListener('astro:page-load', handleExternalLinks);
if (document.readyState !== 'loading') handleExternalLinks();
