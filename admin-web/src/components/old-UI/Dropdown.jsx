import { useEffect, useRef, useState } from "react";

const Dropdown = ({ 
    trigger,
    children,
    align = "right",
    width = "w-56"
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    function toggleDropdown() {
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

        return () => {       
             document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const alignStyles = {
        left: "left-0 origin-top-left",
        right: "right-0 origin-top-right"
    };

  return (
    <div ref={dropdownRef} className="relative inline-block">
        <div onClick={toggleDropdown} className="cursor-pointer">
            {trigger}
        </div>

        {isOpen && (            
            <div className={`absolute z-50 mt-2.5 ${width} ${alignStyles[align]} rounded-[20px] border border-slate-200/80 bg-white/95 backdrop-blur-md p-1.5 shadow-xl shadow-slate-200/60 transition-all duration-200 animate-in fade-in-50 zoom-in-95`}>
                <div className="space-y-0.5">
                    {children}
                </div>
            </div>
        )}
    </div>
  );
};

export default Dropdown;