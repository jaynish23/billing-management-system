import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Edit, Power, History, X } from 'lucide-react';

function ActionMenu({
  isActive,
  onEdit,
  onToggleActive,
  onAudit,
  editLabel = 'Edit',
  activateLabel = 'Activate',
  deactivateLabel = 'Deactivate',
  auditLabel = 'Audit'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, openUpward: false });

  // Handle mobile state detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update dropdown coordinates when opening on desktop
  const updateCoords = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 144; // width in pixels for w-36
      const dropdownHeight = 126; // height for 3 options
      const margin = 4;
      
      let top = rect.bottom + window.scrollY + margin;
      let left = rect.right - dropdownWidth + window.scrollX;
      let openUpward = false;

      // Check if it overflows the bottom of the viewport
      if (rect.bottom + dropdownHeight > window.innerHeight) {
        top = rect.top + window.scrollY - dropdownHeight - margin;
        openUpward = true;
      }

      // Check if it goes off-screen left
      if (left < 0) {
        left = margin + window.scrollX;
      }

      setCoords({ top, left, openUpward });
    }
  };

  // Reposition / close dropdown on scroll or resize
  useEffect(() => {
    if (isOpen && !isMobile) {
      updateCoords();
      const handleScrollOrResize = () => setIsOpen(false);
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
      return () => {
        window.removeEventListener('scroll', handleScrollOrResize, true);
        window.removeEventListener('resize', handleScrollOrResize);
      };
    }
  }, [isOpen, isMobile]);

  // Handle clicking outside to close
  useEffect(() => {
    if (isOpen) {
      const handleOutsideClick = (e) => {
        if (
          buttonRef.current && !buttonRef.current.contains(e.target) &&
          (!dropdownRef.current || !dropdownRef.current.contains(e.target))
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener('click', handleOutsideClick, true);
      return () => document.removeEventListener('click', handleOutsideClick, true);
    }
  }, [isOpen]);

  // Lock scroll on mobile when Bottom Sheet is open
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isMobile]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button 
        ref={buttonRef}
        onClick={toggleMenu}
        className="p-1 text-text-muted hover:text-text-primary rounded-lg hover:bg-bg-darker transition cursor-pointer relative"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {/* Render Desktop Dropdown using portal */}
      {!isMobile && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                top: coords.top,
                left: coords.left,
                width: '144px',
                zIndex: 99999
              }}
              className="bg-bg-lighter border border-border-base rounded-xl p-1 shadow-2xl overflow-hidden pointer-events-auto select-none"
            >
              <button 
                onClick={() => { onEdit(); setIsOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-darker rounded-lg transition text-left cursor-pointer font-semibold"
              >
                <Edit className="w-3.5 h-3.5 text-blue-500" />
                <span>{editLabel}</span>
              </button>
              <button 
                onClick={() => { onToggleActive(); setIsOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-darker rounded-lg transition text-left cursor-pointer font-semibold"
              >
                <Power className="w-3.5 h-3.5 text-orange-500" />
                <span>{isActive ? deactivateLabel : activateLabel}</span>
              </button>
              <button 
                onClick={() => { onAudit(); setIsOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-darker rounded-lg transition text-left cursor-pointer font-semibold"
              >
                <History className="w-3.5 h-3.5 text-text-muted" />
                <span>{auditLabel}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Render Mobile Bottom Sheet using portal */}
      {isMobile && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black z-[99998] pointer-events-auto backdrop-blur-sm"
              />
              
              {/* Drawer content */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="fixed bottom-0 left-0 right-0 bg-bg-lighter border-t border-border-base rounded-t-3xl shadow-2xl z-[99999] px-6 pb-8 pt-4 pointer-events-auto flex flex-col space-y-4 max-w-lg mx-auto"
              >
                {/* Drag handle */}
                <div className="w-12 h-1 bg-border-base rounded-full mx-auto mb-2" />
                
                {/* Header */}
                <div className="flex justify-between items-center pb-2 border-b border-border-base/50">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-text-muted font-bold">Select Action</span>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-bg-darker rounded-lg text-text-muted hover:text-text-primary transition"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Touch Options */}
                <div className="space-y-2 select-none">
                  <button 
                    onClick={() => { onEdit(); setIsOpen(false); }}
                    className="w-full flex items-center justify-between p-4 bg-bg-base/60 hover:bg-bg-darker border border-border-base rounded-2xl transition cursor-pointer text-left font-bold"
                  >
                    <span className="text-sm text-text-primary">{editLabel}</span>
                    <Edit className="w-4.5 h-4.5 text-blue-500" />
                  </button>
                  
                  <button 
                    onClick={() => { onToggleActive(); setIsOpen(false); }}
                    className="w-full flex items-center justify-between p-4 bg-bg-base/60 hover:bg-bg-darker border border-border-base rounded-2xl transition cursor-pointer text-left font-bold"
                  >
                    <span className="text-sm text-text-primary">{isActive ? deactivateLabel : activateLabel}</span>
                    <Power className="w-4.5 h-4.5 text-orange-500" />
                  </button>
                  
                  <button 
                    onClick={() => { onAudit(); setIsOpen(false); }}
                    className="w-full flex items-center justify-between p-4 bg-bg-base/60 hover:bg-bg-darker border border-border-base rounded-2xl transition cursor-pointer text-left font-bold"
                  >
                    <span className="text-sm text-text-primary">{auditLabel}</span>
                    <History className="w-4.5 h-4.5 text-text-muted" />
                  </button>
                </div>

                {/* Cancel button */}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-full py-3.5 bg-bg-darker border border-border-base hover:border-text-muted text-xs font-bold text-text-secondary hover:text-text-primary rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

export default ActionMenu;
