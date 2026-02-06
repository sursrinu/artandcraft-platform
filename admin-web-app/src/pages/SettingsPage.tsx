import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Card, Button, Input, Alert, LoadingSpinner } from '../components';
import apiService from '../services/api';
import { useForm } from '../hooks';

interface Settings {
  appName: string;
  appEmail: string;
  platformCommission: number;
  minOrderAmount: number;
  maxOrderAmount: number;
  enablePayPal: boolean;
  enableStripe: boolean;
  stripeKey?: string;
  paypalKey?: string;
}

const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await apiService.getSettings?.();
        setSettings(response.data?.data?.settings);
        setError(null);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to fetch settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const { formData, errors, isSubmitting, handleChange, handleSubmit } = useForm({
    initialValues: settings ? { ...settings } : {
      appName: '',
      appEmail: '',
      platformCommission: 5,
      minOrderAmount: 10,
      maxOrderAmount: 5000,
      enablePayPal: false,
      enableStripe: false,
      stripeKey: '',
      paypalKey: '',
    },
    onSubmit: async (data) => {
      try {
        await apiService.updateSettings?.(data);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to update settings');
      }
    },
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      {error && <Alert type="error" title="Error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" title="Success" message="Settings updated successfully" onClose={() => setSuccess(false)} />}

      <Card>
        <h2 className="text-xl font-semibold mb-6">Platform Settings</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="App Name" name="appName" value={formData.appName} onChange={handleChange} error={errors.appName} />
            <Input label="App Email" name="appEmail" type="email" value={formData.appEmail} onChange={handleChange} error={errors.appEmail} />
          </div>

          <h3 className="text-lg font-semibold mt-8 mb-4">Commission Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input label="Platform Commission (%)" name="platformCommission" type="number" step="0.01" value={formData.platformCommission} onChange={handleChange} error={errors.platformCommission} />
            <Input label="Minimum Order Amount" name="minOrderAmount" type="number" value={formData.minOrderAmount} onChange={handleChange} error={errors.minOrderAmount} />
            <Input label="Maximum Order Amount" name="maxOrderAmount" type="number" value={formData.maxOrderAmount} onChange={handleChange} error={errors.maxOrderAmount} />
          </div>

          <h3 className="text-lg font-semibold mt-8 mb-4">Payment Gateway Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input type="checkbox" name="enableStripe" checked={formData.enableStripe} onChange={handleChange} className="w-4 h-4 text-blue-600" />
              <label className="ml-2 text-sm text-gray-700">Enable Stripe</label>
            </div>
            {formData.enableStripe && <Input label="Stripe API Key" name="stripeKey" type="password" value={formData.stripeKey} onChange={handleChange} error={errors.stripeKey} />}

            <div className="flex items-center mt-4">
              <input type="checkbox" name="enablePayPal" checked={formData.enablePayPal} onChange={handleChange} className="w-4 h-4 text-blue-600" />
              <label className="ml-2 text-sm text-gray-700">Enable PayPal</label>
            </div>
            {formData.enablePayPal && <Input label="PayPal API Key" name="paypalKey" type="password" value={formData.paypalKey} onChange={handleChange} error={errors.paypalKey} />}
          </div>

          <div className="flex justify-end mt-8">
            <Button icon={<Save size={20} />} loading={isSubmitting} type="submit">Save Settings</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SettingsPage;
