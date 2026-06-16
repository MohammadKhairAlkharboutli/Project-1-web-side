import { useState } from "react";
import Button from "../components/UI/Button";
import { boxShadow, inputBase, labelBase } from "../components/UI/SurfaceStyles";
import { authApi } from "../api/authApi";
import { useNavigate } from "react-router-dom";


   //checking if the email is an email same for phone number

   const isEmail = (value) => {
   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}; 


    const isPhone = (value) => {
  return /^\+?[0-9\s-]{7,15}$/.test(value);
};

const cleanPhone = (value) => {
  return value.replace(/\s/g, "").replace(/-/g, "");
};


const LoginPage = () => {
    
    const [loginValue,setLoginValue]=useState("")
    const [password,setPassword]=useState("")
    const [error,setError]=useState("")               //the error stop execution and is shown in condition renedering

    const navigate=useNavigate();

 

async  function handleSubmit(event) {
    event.preventDefault();

   
    

    setError("")

    const trimmedLoginValue=loginValue.trim()
  

    if (!trimmedLoginValue) {
        setError("please enter your email or phone number")
        return;
    }
    if (!password) {
        setError("please enter your password")
        return;
    }
    if(password.length<8){
        setError("your password should be at least 8 characters")
        return
    }

    let loginData;

    if (isEmail(trimmedLoginValue)) {
        loginData={
            email: trimmedLoginValue,
            password: password,
        };
    }
    else if (isPhone(trimmedLoginValue)) {
        loginData={
            phone: cleanPhone(trimmedLoginValue),
            password: password
        }
        
    }
    else {
        setError("please enter a valid email or phone number.")
        return
    }

 
    
    try{
        console.log("we are in the start of the try block");
        const response = await authApi.login(loginData)
        if(response.user.role!=="admin"){
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            setError("This account is not allowed to access the admin dashboard");
            return;
        }

        navigate("/",{replace:true})


        console.log(response);
        
        
    } catch(requestError){
        console.log("full error: ",requestError);
        console.log("backend error: ",requestError.response?.data);
        
        const backendMessage = requestError.response?.data?.message;
        setError("the error that happened is that "+backendMessage)
    }

    console.log("Login submitted");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-page)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Tabibi</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to access your admin dashboard
          </p>
        </div>

        <div className={`${boxShadow} p-6`}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelBase}>Email or phone number</label>
              <input
                type="text"
                placeholder="name@clinic.com or 09XXXXXXXX"
                className={inputBase}
                value={loginValue}
                onChange={(event)=> setLoginValue(event.target.value)}
              />
            </div>

            <div>
              <label className={labelBase}>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className={inputBase}
                value={password}
                onChange={(event)=> setPassword(event.target.value)}
              />
            </div>

             {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          © 2026 Clinic Admin
        </p>
      </div>
    </div>
  );
};

export default LoginPage;