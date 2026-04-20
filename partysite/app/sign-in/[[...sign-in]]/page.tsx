import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6">
      <SignIn fallbackRedirectUrl="/admin" signUpUrl="/sign-up" />
    </div>
  );
}
