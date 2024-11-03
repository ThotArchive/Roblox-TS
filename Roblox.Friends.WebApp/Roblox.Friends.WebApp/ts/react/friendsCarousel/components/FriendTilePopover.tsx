import React, { useState, useRef, useEffect } from 'react';

interface PopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  dropdownWidth: number;
}

const FriendTilePopover: React.FC<PopoverProps> = ({ trigger, content, dropdownWidth }) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleMouseOver = () => {
    setIsOpen(true);
  };

  const handleMouseOut = (event: { relatedTarget: any }) => {
    if (
      event != null &&
      !triggerRef.current?.contains(event.relatedTarget as Node) &&
      !popoverRef.current?.contains(event.relatedTarget as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (triggerRef.current) {
      triggerRef.current.addEventListener('mouseover', handleMouseOver);
      triggerRef.current.addEventListener('mouseout', handleMouseOut);

      return () => {
        triggerRef.current?.removeEventListener('mouseover', handleMouseOver);
        triggerRef.current?.removeEventListener('mouseout', handleMouseOut);
      };
    }
    return () => {
      /* Do nothing if no trigger ref */
    };
  }, []);

  return (
    <div>
      <div ref={triggerRef}>{trigger}</div>
      {isOpen && (
        <div
          ref={popoverRef}
          style={{
            position: 'absolute',
            top: (triggerRef.current?.offsetHeight || 0) + (triggerRef.current?.offsetTop || 0),
            left:
              (triggerRef.current?.offsetLeft || 0) +
              (triggerRef.current?.offsetWidth || 0) / 2 -
              dropdownWidth / 2,
            zIndex: 1002,
            width: dropdownWidth
          }}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
          onFocus={handleMouseOver}
          onBlur={handleMouseOut}>
          {content}
        </div>
      )}
    </div>
  );
};

export default FriendTilePopover;
