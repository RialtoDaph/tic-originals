import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Save } from 'lucide-react';

const KEY = 'current_collection';

export default function AdminSettings() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: row, isLoading } = useQuery({
    queryKey: ['admin-site-setting', KEY],
    queryFn: async () => {
      const rows = await base44.entities.SiteSetting.filter({ key: KEY });
      return rows[0] || null;
    },
  });

  useEffect(() => {
    if (row) setValue(row.value || '');
    else setValue('001');
  }, [row]);

  const handleSave = async () => {
    setSaving(true);
    if (row?.id) {
      await base44.entities.SiteSetting.update(row.id, { value });
    } else {
      await base44.entities.SiteSetting.create({ key: KEY, value, description: 'Current collection label shown on Home and Shop' });
    }
    await qc.invalidateQueries({ queryKey: ['admin-site-setting', KEY] });
    await qc.invalidateQueries({ queryKey: ['site-setting', KEY] });
    setSaving(false);
    toast({ title: 'Saved', description: `Current collection set to ${value}` });
  };

  return (
    <div className="max-w-xl">
      <h2 className="font-heading text-2xl mb-2">Site Settings</h2>
      <p className="text-sm text-gray-text mb-8">Manage global labels displayed across the shop.</p>

      <div className="border border-border p-6 rounded-md space-y-4">
        <div>
          <Label className="text-xs tracking-[0.2em] uppercase text-gray-text">Current Collection</Label>
          <p className="text-xs text-gray-text mt-1 mb-3">Displayed as "Collection {value || '...'}" on Home and Shop pages.</p>
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="002"
            disabled={isLoading}
            className="max-w-[200px]"
          />
        </div>
        <Button onClick={handleSave} disabled={saving || isLoading || !value.trim()} className="gap-2">
          <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  );
}