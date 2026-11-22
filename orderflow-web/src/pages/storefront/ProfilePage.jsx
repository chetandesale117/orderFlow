import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Shield,
  Mail,
  CheckCircle,
} from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { GlassCard } from '../../components/common/GlassCard';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Skeleton } from '../../components/common/Skeleton';
import {
  useProfile,
  useUpdateProfile,
  useAddresses,
  useAddAddress,
  useDeleteAddress,
} from '../../hooks/api/useUser';
import { useAuthStore } from '../../stores/authStore';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
});

const addressFormSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  streetLine1: z.string().min(3, 'Street address is required'),
  streetLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  phone: z.string().min(5, 'Phone number is required'),
});

export function ProfilePage() {
  const { user } = useAuthStore();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: addressesData, isLoading: addressesLoading } = useAddresses();
  const addresses = addressesData || [];

  const updateProfileMutation = useUpdateProfile();
  const addAddressMutation = useAddAddress();
  const deleteAddressMutation = useDeleteAddress();

  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const {
    register: regProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    values: {
      fullName: profile?.fullName || user?.fullName || '',
      phone: profile?.phone || '',
    },
  });

  const {
    register: regAddress,
    handleSubmit: handleAddressSubmit,
    reset: resetAddressForm,
    formState: { errors: addressErrors },
  } = useForm({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      streetLine1: '',
      streetLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'USA',
      phone: '',
    },
  });

  const onProfileSubmit = (data) => {
    updateProfileMutation.mutate(data);
  };

  const onAddressSubmit = (data) => {
    addAddressMutation.mutate(data, {
      onSuccess: () => {
        setAddressModalOpen(false);
        resetAddressForm();
      },
    });
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Account &amp; Settings</h1>
        <p className="text-xs text-text-muted mt-1">Manage your identity, security credentials, and address book</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Profile info */}
        <div className="space-y-6">
          <GlassCard className="p-6 border-white/10 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary-light flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Personal Profile</h3>
                <Badge variant={user?.role === 'ADMIN' ? 'primary' : 'secondary'} size="sm">
                  {user?.role || 'CUSTOMER'}
                </Badge>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
              <div>
                <Input
                  label="Email Address (Locked)"
                  value={user?.email || ''}
                  disabled
                  icon={Mail}
                  helperText="Email is bound to your JWT principal"
                />
              </div>

              <div>
                <Input
                  label="Full Name"
                  error={profileErrors.fullName?.message}
                  {...regProfile('fullName')}
                />
              </div>

              <div>
                <Input
                  label="Phone Number"
                  placeholder="+1 (555) 000-0000"
                  error={profileErrors.phone?.message}
                  {...regProfile('phone')}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="w-full mt-2"
                isLoading={updateProfileMutation.isPending}
              >
                Save Profile Changes
              </Button>
            </form>
          </GlassCard>
        </div>

        {/* Right column: Address Book */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-6 border-white/10 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-primary" />
                <h3 className="text-base font-semibold text-text-primary">
                  Saved Delivery Addresses ({addresses.length})
                </h3>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={Plus}
                onClick={() => setAddressModalOpen(true)}
              >
                Add Address
              </Button>
            </div>

            {addressesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
              </div>
            ) : addresses.length === 0 ? (
              <div className="p-8 text-center rounded-xl glass border border-white/5 bg-white/[0.02]">
                <MapPin className="w-8 h-8 text-text-muted mx-auto mb-2" />
                <p className="text-xs text-text-muted">No addresses saved yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-4 rounded-xl glass border border-white/10 bg-white/[0.02] flex flex-col justify-between"
                  >
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-text-primary">{addr.fullName}</span>
                        {addr.isDefault && (
                          <Badge variant="success" size="sm">Default</Badge>
                        )}
                      </div>
                      <p className="text-text-muted">{addr.streetLine1}</p>
                      {addr.streetLine2 && <p className="text-text-muted">{addr.streetLine2}</p>}
                      <p className="text-text-muted">
                        {addr.city}, {addr.state} {addr.postalCode}
                      </p>
                      <p className="text-text-muted">{addr.country}</p>
                      <p className="font-mono pt-1 text-text-secondary">{addr.phone}</p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-white/5 flex justify-end">
                      <button
                        onClick={() => setDeleteId(addr.id)}
                        className="text-text-muted hover:text-status-error p-1 transition-colors cursor-pointer"
                        aria-label="Delete address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        title="Add Delivery Address"
        description="Add a new destination for fast one-click checkout"
        size="md"
      >
        <form onSubmit={handleAddressSubmit(onAddressSubmit)} className="space-y-3 pt-2">
          <Input
            label="Recipient Full Name"
            error={addressErrors.fullName?.message}
            {...regAddress('fullName')}
          />
          <Input
            label="Street Address Line 1"
            error={addressErrors.streetLine1?.message}
            {...regAddress('streetLine1')}
          />
          <Input
            label="Street Address Line 2 (Optional)"
            error={addressErrors.streetLine2?.message}
            {...regAddress('streetLine2')}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              error={addressErrors.city?.message}
              {...regAddress('city')}
            />
            <Input
              label="State / Province"
              error={addressErrors.state?.message}
              {...regAddress('state')}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Postal Code"
              error={addressErrors.postalCode?.message}
              {...regAddress('postalCode')}
            />
            <Input
              label="Country"
              error={addressErrors.country?.message}
              {...regAddress('country')}
            />
          </div>
          <Input
            label="Contact Phone"
            error={addressErrors.phone?.message}
            {...regAddress('phone')}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-4">
            <Button variant="ghost" size="sm" onClick={() => setAddressModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={addAddressMutation.isPending}
            >
              Save Address
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Address Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteAddressMutation.mutate(deleteId, {
              onSuccess: () => setDeleteId(null),
            });
          }
        }}
        title="Delete Address"
        message="Are you sure you want to remove this delivery address from your profile?"
        confirmText="Delete"
        isDestructive={true}
        isLoading={deleteAddressMutation.isPending}
      />
    </div>
  );
}
