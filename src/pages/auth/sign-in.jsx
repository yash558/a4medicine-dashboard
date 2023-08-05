import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { useState } from "react";
import API from "../../API";
import toast, { Toaster } from "react-hot-toast";
import Loading from "../../components/Loading";
import axios from "axios";

export function SignIn() {
  const history = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState(""); 
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}auth/login/`, {
        email,
        password,
      });

      if (response.data.status === "success") {
        
        toast.success("Successfully Login!");
        setLoading(false);
        // setLoading(false);
        localStorage.setItem("token", response.data.token);
        console.log(response.data.token)
        // localStorage.setItem("id", response.data.data.id);
        // localStorage.setItem("email", response.data.data.email);
        // localStorage.setItem("firstName", response.data.data.firstName);
        // localStorage.setItem("lastName", response.data.data.lastName);
        // localStorage.setItem("plan", response.data.data.plan);
        setTimeout(() => {
          history("/");
          window.location.reload();
        }, 3000);
      } else {
        setLoading(false);
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  console.log(email, password);
  return (
    <>
      <img
        src="https://images.unsplash.com/photo-1497294815431-9365093b7331?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1950&q=80"
        className="absolute inset-0 z-0 h-full w-full object-cover"
        alt=""
      />
      <div className="absolute inset-0 z-0 h-full w-full bg-black/50" />
      <div className="container mx-auto p-4">
        <Toaster position="top-center" reverseOrder={false} />
        {loading ? (
          <div className="h-screen flex items-center justify-center">
            <Loading color="#0058AB" />
          </div>
        ) : (
          <Card className="absolute top-2/4 left-2/4 w-full max-w-[24rem] -translate-y-2/4 -translate-x-2/4">
            <CardHeader
              variant="gradient"
              color="blue"
              className="mb-4 grid h-28 place-items-center"
            >
              <Typography variant="h3" color="white">
                Sign In
              </Typography>
            </CardHeader>
            <form className="flex flex-col gap-4 p-4" onSubmit={handleSubmit} >
              <Input
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                size="lg"
              />
              <Input               
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                onChange={(e) => setPassword(e.target.value)}
                size="lg"
              />
                  {/* <button
                        type="button"
                        className="password-toggle-button"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? (
                          <FontAwesomeIcon
                            icon={faEye}
                            className="text-gray-400"
                          />
                        ) : (
                          <FontAwesomeIcon
                            icon={faEyeLowVision}
                            className="text-gray-400"
                          />
                        )}
                      </button> */}
            </form>
            <CardFooter className="pt-0">
              <Button variant="gradient" onClick={handleSubmit} fullWidth>
                Sign In
              </Button>
              <Typography variant="small" className="mt-6 flex justify-center">
                Don't have an account?
                <Link to="/auth/sign-up">
                  <Typography
                    as="span"
                    variant="small"
                    color="blue"
                    className="ml-1 font-bold"
                  >
                    Sign up
                  </Typography>
                </Link>
              </Typography>
            </CardFooter>
          </Card>
        )}
      </div>
    </>
  );
}

export default SignIn;
