import { LoginForm } from "@/src/components/auth/LoginForm/LoginForm";

export const metadata = {
  title: "Login - ChatApp",
  description: "Sign in to your ChatApp account",
};

export default function LoginPage() {
  return <LoginForm />;
}