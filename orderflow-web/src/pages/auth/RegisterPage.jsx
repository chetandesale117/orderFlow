import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { GlassCard } from '../../components/common/GlassCard';
import { useRegister } from '../../hooks/api/useAuth';
import { ROUTES } from '../../config/routes';

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export function RegisterPage() {
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data) => {
    registerMutation.mutate({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
    });
  };

  return (
    <GlassCard className="p-8 sm:p-10 border-white/15 bg-surface-secondary/80">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">Create your account</h2>
        <p className="text-xs text-text-muted mt-1.5">
          Join OrderFlow to experience synchronous microservices with real-time Saga tracking
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          icon={User}
          error={errors.fullName?.message}
          {...register('fullName')}
        />

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
          helperText="Minimum 8 characters"
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          isLoading={registerMutation.isPending}
          icon={ArrowRight}
          iconPosition="right"
        >
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-text-muted">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="text-primary hover:underline font-semibold">
          Sign In
        </Link>
      </div>
    </GlassCard>
  );
}
