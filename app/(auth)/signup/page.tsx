"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { signupCustomer } from "@/lib/actions/auth";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const l = t.signup;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);

    const res = await signupCustomer(formData);
    
    setIsLoading(false);

    if (res.success) {
      if ((res as any).session) {
        router.push("/dashboard");
      } else {
        router.push("/confirm");
      }
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            {l.title}
          </h2>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            {l.subtitle}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {errorMsg && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
            {errorMsg}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700 ms-1">
            {l.name}
          </label>
          <div className="relative group">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={l.namePlaceholder}
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700 ms-1">
            {l.email}
          </label>
          <div className="relative group">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={l.emailPlaceholder}
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700 ms-1">
            {l.password}
          </label>
          <div className="relative group">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={l.passwordPlaceholder}
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-3.5 mt-2 text-sm shadow-indigo-500/25"
          isLoading={isLoading}
        >
          {isLoading ? l.signingUp : l.signUp}
        </Button>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            {l.alreadyHaveAccount}{" "}
            <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
              {t.login.signIn}
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
