import Signin from "@/components/Auth/Signin";
import SigninWithPassword from "@/components/Auth/SigninWithPassword";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign in",
};

type PropsType = {
  searchParams: Promise<{
    redirect?: string;
  }>;
};

export default async function SignIn({ searchParams }: PropsType) {
  const { redirect } = await searchParams;

  return (
    <>
      <section className="h-screen grid place-items-center">
        <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card w-100">
          <div className="flex flex-wrap items-center">
            <div className="w-full">
              <div className="w-full p-4 sm:p-12.5 xl:p-15">
                <SigninWithPassword redirectTo={redirect} />
              </div>
            </div>
          </div>
        </div>
      </section>


    </>
  );
}
