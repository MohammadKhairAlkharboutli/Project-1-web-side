
const DropdownItem = ({
    children,
    onClick,
    danger=false,
    disabled=false,
}) => {

    const normalStyles = "text-slate-700 hover:bg-slate-100"
    const dangerStyles = "text-red-600 hover:bg-red-50"

  return (
    <button type="button" onClick={onClick} disabled={disabled}
            className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm disabled:cursor-not-allowed disabled:opacity-50
                        ${danger ? dangerStyles : normalStyles}`}>

                {children} 

    </button>
  )
}

export default DropdownItem