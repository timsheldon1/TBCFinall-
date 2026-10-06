import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, RefreshCw, Pencil, X } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

type DraftStatus = 'pending' | 'approved' | 'rejected' | 'sent' | 'failed';

interface Draft {
  _id: string;
  brief: string;
  subject: string;
  plainText: string;
  imageUrl?: string;
  status: DraftStatus;
  failureReason?: string;
  createdAt: string;
}

const STATUS_STYLES: Record<DraftStatus, string> = {
  pending:  'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200',
  approved: 'bg-blue-50   text-blue-700   ring-1 ring-blue-200',
  sent:     'bg-green-50  text-green-700  ring-1 ring-green-200',
  rejected: 'bg-gray-100  text-gray-600   ring-1 ring-gray-200',
  failed:   'bg-red-50    text-red-700    ring-1 ring-red-200',
};

export default function AdminMarketing() {
  const [brief, setBrief] = useState('');
  const [generating, setGenerating] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editPlainText, setEditPlainText] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchDrafts = async () => {
    setLoadingDrafts(true);
    try {
      const { data } = await api.get('/marketing/drafts');
      setDrafts(data.drafts || []);
    } catch (err) {
      console.error('Failed to load drafts', err);
    } finally {
      setLoadingDrafts(false);
    }
  };

  useEffect(() => { fetchDrafts(); }, []);

  const handleGenerate = async () => {
    if (!brief.trim()) return;
    setGenerating(true);
    try {
      const { data } = await api.post('/marketing/generate-campaign', { brief: brief.trim() });
      if (data.warning) {
        toast.warning(data.warning);
      } else {
        toast.success(`Draft "${data.subject}" sent to Telegram for approval`);
      }
      setBrief('');
      fetchDrafts();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to generate draft');
    } finally {
      setGenerating(false);
    }
  };

  const startEdit = (d: Draft) => {
    setEditingId(d._id);
    setEditSubject(d.subject);
    setEditPlainText(d.plainText);
  };

  const cancelEdit = () => setEditingId(null);

  const handleSaveEdit = async (id: string) => {
    if (!editSubject.trim() || !editPlainText.trim()) return;
    setSaving(true);
    try {
      await api.patch(`/marketing/drafts/${id}`, {
        subject: editSubject.trim(),
        plainText: editPlainText.trim(),
      });
      toast.success('Draft updated and re-sent to Telegram for approval');
      setEditingId(null);
      fetchDrafts();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update draft');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/admin/dashboard" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Marketing Agent</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Generate a campaign draft</CardTitle>
            <p className="text-sm text-gray-500">
              Describe what you want — the agent will pull real package/property details and write the copy.
              Every draft goes to Telegram for you to approve or reject before anything sends.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder='e.g. "A December push for our Zanzibar beach property"'
              rows={3}
              disabled={generating}
            />
            <Button onClick={handleGenerate} disabled={generating || !brief.trim()}>
              <Send className="h-4 w-4 mr-2" />
              {generating ? 'Generating…' : 'Generate Draft'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent drafts</CardTitle>
            <Button variant="ghost" size="sm" onClick={fetchDrafts} disabled={loadingDrafts}>
              <RefreshCw className={`h-4 w-4 ${loadingDrafts ? 'animate-spin' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent>
            {drafts.length === 0 ? (
              <p className="text-sm text-gray-400">No drafts yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {drafts.map((d) => {
                  const canEdit = d.status === 'pending' || d.status === 'failed';
                  const isEditing = editingId === d._id;
                  return (
                    <div key={d._id} className="py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex items-start gap-3">
                          {d.imageUrl && (
                            <img src={d.imageUrl} alt="" className="w-12 h-12 rounded object-cover shrink-0 bg-gray-100" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{d.subject}</p>
                            <p className="text-xs text-gray-400 truncate">{d.brief}</p>
                            {d.status === 'failed' && d.failureReason && (
                              <p className="text-xs text-red-500 mt-1">{d.failureReason}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge className={`text-[10px] uppercase tracking-wide ${STATUS_STYLES[d.status]}`}>
                            {d.status}
                          </Badge>
                          {canEdit && !isEditing && (
                            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => startEdit(d)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {isEditing && (
                        <div className="mt-3 space-y-2 bg-gray-50 rounded-md p-3">
                          <input
                            value={editSubject}
                            onChange={(e) => setEditSubject(e.target.value)}
                            className="w-full text-sm border rounded px-2 py-1.5"
                            placeholder="Subject"
                            disabled={saving}
                          />
                          <Textarea
                            value={editPlainText}
                            onChange={(e) => setEditPlainText(e.target.value)}
                            rows={6}
                            disabled={saving}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(d._id)}
                              disabled={saving || !editSubject.trim() || !editPlainText.trim()}
                            >
                              {saving ? 'Saving…' : 'Save & Re-send for Approval'}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelEdit} disabled={saving}>
                              <X className="h-3.5 w-3.5 mr-1" /> Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
