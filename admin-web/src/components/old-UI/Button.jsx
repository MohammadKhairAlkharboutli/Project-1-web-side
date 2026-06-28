

//need to understand the type , and how props work
const Button = ({children, variant="primary", size="md" , className="" , type="button", ...props}) => {

    const baseStyles = "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors"

    const variants= {
         primary:
    "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]",

  secondary:
    "border border-[var(--color-border)] bg-white text-slate-700 hover:bg-slate-50",

  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",

  danger:
    "bg-[var(--color-danger)] text-white hover:bg-[var(--color-danger-hover)]",
    }

    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-5 text-sm",
        icon: "h-9 w-9 p-0",  
    }

  return (
   <button 
        type={type}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
        >
            {children}

   </button>
  )
}

export default Button