import Link from "next/link";
import GoogleSigninButton from "../GoogleSigninButton";
import SigninWithPassword from "../SigninWithPassword";

export default function Signin({ redirectTo }: { redirectTo?: string }) {
  return (
    <>
      

      
      <div>
        <SigninWithPassword redirectTo={redirectTo} />
      </div>

      
    </>
  );
}
