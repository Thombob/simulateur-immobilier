'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  const [notionToken, setNotionToken] = useState('');
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Parametres" description="Configure ton Life OS" />

      <div className="space-y-6">
        <Card>
          <CardTitle>Profil</CardTitle>
          <CardContent>
            <div className="mt-3 space-y-4">
              <Input label="Nom complet" placeholder="Ton nom..." />
              <Input label="Email" type="email" disabled placeholder="email@exemple.com" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardTitle className="flex items-center gap-2">
            Integration Notion
            <Badge variant="outline">Optionnel</Badge>
          </CardTitle>
          <CardContent>
            <div className="mt-3 space-y-4">
              <Input
                label="Token d'integration Notion"
                type="password"
                value={notionToken}
                onChange={(e) => setNotionToken(e.target.value)}
                placeholder="secret_..."
              />
              <p className="text-xs text-zinc-500">
                Cree une integration sur notion.so/my-integrations et colle le token ici.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardTitle>Preferences IA</CardTitle>
          <CardContent>
            <div className="mt-3 space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm text-zinc-700 dark:text-zinc-300">Analyse automatique</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-zinc-700 dark:text-zinc-300">Langue</span>
                <select className="text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 bg-white dark:bg-zinc-900">
                  <option value="fr">Francais</option>
                  <option value="en">English</option>
                </select>
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button onClick={handleSave}>
            {saved ? 'Sauvegarde !' : 'Sauvegarder'}
          </Button>
        </div>
      </div>
    </div>
  );
}
