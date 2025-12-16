import { RegisterForm } from "@/src/components/auth/RegisterForm/RegisterForm";

export const metadata = {
  title: "Register - ChatApp",
  description: "Create a new ChatApp account",
};

export default function RegisterPage() {
  return <RegisterForm />;
}