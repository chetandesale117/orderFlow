import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { GlassCard } from '../../components/common/GlassCard';
import { useLogin } from '../../hooks/api/useAuth';
import { ROUTES } from '../../config/routes';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export function LoginPage() {
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };

  const setTestAccount = (email, password) => {
    setValue('email', email);
    setValue('password', password);
  };

  return (
    <GlassCard className="p-8 sm:p-10 border-white/15 bg-surface-secondary/80">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">Welcome back</h2>
        <p className="text-xs text-text-muted mt-1.5">
          Sign in to access your orders, cart, and account settings
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          icon={Mail}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          error={errors.password?.message}
          {...register('password')}
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          isLoading={loginMutation.isPending}
          icon={ArrowRight}
          iconPosition="right"
        >
          Sign In
        </Button>
      </form>

      {/* Quick demo accounts */}
      <div className="mt-6 pt-5 border-t border-white/10">
        <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2.5">
          Quick Demo Accounts
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTestAccount('admin@orderflow.internal', 'AdminSecret123!')}
            className="p-2 rounded-xl glass hover:bg-white/10 border border-white/10 text-left cursor-pointer transition-all"
          >
            <div className="flex items-center gap-1.5 text-primary-light text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Role</span>
            </div>
            <p className="text-[10px] text-text-muted truncate mt-0.5">admin@orderflow.internal</p>
          </button>

          <button
            type="button"
            onClick={() => setTestAccount('john@example.com', 'Password123!')}
            className="p-2 rounded-xl glass hover:bg-white/10 border border-white/10 text-left cursor-pointer transition-all"
          >
            <div className="flex items-center gap-1.5 text-text-primary text-xs font-semibold">
              <span>Customer</span>
            </div>
            <p className="text-[10px] text-text-muted truncate mt-0.5">john@example.com</p>
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-text-muted">
        Don't have an account?{' '}
        <Link to={ROUTES.REGISTER} className="text-primary hover:underline font-semibold">
          Create an account
        </Link>
      </div>
    </GlassCard>
  );
}
