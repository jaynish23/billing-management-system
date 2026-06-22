import { useEffect, useState } from 'react';

function GlobalLoader({ show, text = 'Processing Request...' }) {
  const [theme, setTheme] = useState(() => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });
  
  const [shouldRender, setShouldRender] = useState(show);
  const [opacityClass, setOpacityClass] = useState('opacity-0');

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      const frame = requestAnimationFrame(() => {
        setOpacityClass('opacity-100');
      });
      return () => cancelAnimationFrame(frame);
    } else {
      setOpacityClass('opacity-0');
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!shouldRender) return null;

  const videoSrc = theme === 'dark' ? '/videos/dark-loader.mp4' : '/videos/light-loader.mp4';
  
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 99999,
    backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    transition: 'opacity 300ms ease-in-out',
    pointerEvents: 'auto'
  };

  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const subtextColor = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';

  return (
    <div 
      style={overlayStyle}
      className={`flex flex-col items-center justify-center select-none ${opacityClass} ${textColor}`}
    >
      <div className="flex flex-col items-center space-y-6 max-w-md px-6 text-center">
        {/* Transparent Video Area */}
        <div className="w-[200px] md:w-[240px] lg:w-[300px] flex items-center justify-center bg-transparent">
          <video 
            key={videoSrc}
            autoPlay 
            muted 
            loop 
            playsInline
            controls={false}
            className="w-full h-auto bg-transparent pointer-events-none"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        </div>

        {/* Dynamic Loading Text */}
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-bold tracking-tight">
            {text}
          </h3>
          <p className={`text-xs sm:text-sm font-medium ${subtextColor}`}>
            Please wait while we complete your operation...
          </p>
        </div>
      </div>
    </div>
  );
}

export default GlobalLoader;
