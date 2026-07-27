import { useEffect, useRef, useState } from "react";

const Dropdown = ({ 
    trigger,
    children,
    align = "right",
    width = "w-56"
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const dropdownRef = useRef(null);
    const triggerRef = useRef(null);

    function toggleDropdown() {
        if (!isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            
            // حساب الإحداثيات بدقة حسب اتجاه المحاذاة
            let left = align === "right" ? rect.right - 224 : rect.left; 
            if (align === "right" && left < 10) left = rect.left;

            setCoords({
                top: rect.bottom + 8,
                left: left,
            });
        }
        setIsOpen((currentValue) => !currentValue);
    }

    function closeDropdown() {
        setIsOpen(false);
    }

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) 
                closeDropdown();
        }
        
        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("scroll", closeDropdown, true);
        window.addEventListener("resize", closeDropdown);

        return () => {       
             document.removeEventListener("mousedown", handleClickOutside);
             window.removeEventListener("scroll", closeDropdown, true);
             window.removeEventListener("resize", closeDropdown);
        };
    }, []);

    return (
        <div ref={dropdownRef} className="relative inline-block text-left">
            <div ref={triggerRef} onClick={toggleDropdown} className="cursor-pointer">
                {trigger}
            </div>

            {isOpen && (            
                <div 
                    style={{
                        top: `${coords.top}px`,
                        left: `${coords.left}px`,
                    }}
                    className={`fixed z-[999999] ${width} rounded-[20px] border border-slate-200/80 bg-white/95 backdrop-blur-md p-1.5 shadow-2xl shadow-slate-900/10 transition-all duration-200 animate-in fade-in-50 zoom-in-95`}
                >
                    <div className="space-y-0.5">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dropdown;