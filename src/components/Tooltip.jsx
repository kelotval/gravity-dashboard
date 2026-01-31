import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Tooltip({ content, children, className = "" }) {
    const [isVisible, setIsVisible] = useState(false);
    const triggerRef = useRef(null);
    const [coords, setCoords] = useState({ left: 0, top: 0, placement: 'top' });

    const updatePosition = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const scrollX = window.scrollX || window.pageXOffset;
            const scrollY = window.scrollY || window.pageYOffset;

            // Check space relative to viewport, but set coords relative to document
            const placement = rect.top < 100 ? 'bottom' : 'top';

            setCoords({
                left: rect.left + rect.width / 2 + scrollX,
                // If top, we want the top of the element. If bottom, the bottom.
                // We add scrollY because we are using absolute positioning relative to body
                top: (placement === 'top' ? rect.top : rect.bottom) + scrollY,
                placement
            });
        }
    };

    useEffect(() => {
        if (isVisible) {
            updatePosition();
            // We can largely avoid scroll listeners for window scroll since 'absolute' moves with it.
            // But we keep them for resize or if the element is in a scrolling container.
            window.addEventListener("resize", updatePosition);
            window.addEventListener("scroll", updatePosition, true);
        }
        return () => {
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition, true);
        };
    }, [isVisible]);

    return (
        <div
            ref={triggerRef}
            className={`relative inline-flex items-center ${className}`}
            onMouseEnter={() => {
                updatePosition();
                setIsVisible(true);
            }}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && createPortal(
                <div
                    className="absolute mb-2 w-48 p-2 bg-gray-900 border border-gray-700 text-xs text-white rounded-lg shadow-2xl pointer-events-none transition-opacity duration-150"
                    style={{
                        zIndex: 2147483647, // Max Safe Integer for Z-Index
                        left: coords.left,
                        top: coords.top,
                        transform: coords.placement === 'top'
                            ? "translate(-50%, -100%) translateY(-8px)"
                            : "translate(-50%, 0) translateY(8px)",
                        opacity: 1
                    }}
                >
                    {content}
                    {/* Arrow */}
                    <div
                        className={`absolute left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 border-gray-700 rotate-45 ${coords.placement === 'top' ? '-bottom-1 border-b border-r' : '-top-1 border-t border-l'
                            }`}
                    ></div>
                </div>,
                document.body
            )}
        </div>
    );
}
