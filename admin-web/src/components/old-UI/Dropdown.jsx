import { useEffect, useRef, useState } from "react";


const Dropdown = ({   
    trigger,
    children,
    align = "right",
    width = "w-48"
}) => {

    const [isOpen,setIsOpen]= useState(false);
    const dropdownRef=useRef(null);

    function toggleDropdown(){
        setIsOpen((currentValue)=> !currentValue)
    }

    function closeDropdown(){
        setIsOpen(false);
    }

    useEffect( //this is so that when the dropdown is opened we quit when we click outside
        ()=>{
            function handleClickOutside(event){
                if(dropdownRef.current && !dropdownRef.current.contains(event.target))   //this means if the dropdown exists and the thing you clicked is NOT inside the dropdown
                    closeDropdown();
            }
            
            document.addEventListener("mousedown",handleClickOutside);

            return () => {       //clean up function to remove listening to clicks
                 document.removeEventListener("mousedown",handleClickOutside)
            }
        },[])

        const alignStyles={
            left:"left-0",
            right:"right-0"
        }



  return (
    <div ref={dropdownRef} className="relative inline-block" >
        <div onClick={toggleDropdown}>{trigger}</div>

        {isOpen && (                //this is the styling of the dropdown menu as a whole not the buttons
            <div className={`absolute z-50 mt-2  ${width} ${alignStyles[align]} rounded-lg border border-slate-200 bg-white py-1 shadow-lg`}>
                {children}
            </div>
        )}

    </div>
  )
}

export default Dropdown