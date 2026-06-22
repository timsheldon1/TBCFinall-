import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Plus, Pencil, Trash2, CalendarDays, DollarSign, ChevronDown, ChevronUp, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  useSeasonalRates,
  SeasonalRate,
  RateEntry,
  DateRange,
  MealPlan,
  SeasonType,
  SEASON_LABELS,
  SEASON_COLORS,
  MEAL_PLAN_LABELS,
  getLowestRate,
} from '@/hooks/useSeasonalRates';
import { useBackendProperties } from '@/hooks/useBackendProperties';

// ─── Season form state ────────────────────────────────────────────────────────

const EMPTY_DATE_RANGE: DateRange = { startDate: '', endDate: '' };

const EMPTY_RATE_ENTRY: RateEntry = {
  roomType: '', sglBB: null, dblBB: null, sglHB: null, dblHB: null,
};

interface FormState {
  propertyId: string;
  name: string;
  seasonType: SeasonType;
  dateRanges: DateRange[];
  availableMealPlans: MealPlan[];
  rates: RateEntry[];
  minNights: number;
  isActive: boolean;
}

const EMPTY_FORM: FormState = {
  propertyId: '',
  name: '',
  seasonType: 'high',
  dateRanges: [{ ...EMPTY_DATE_RANGE }],
  availableMealPlans: ['BB', 'HB'],
  rates: [],
  minNights: 1,
  isActive: true,
};

// ─── Year timeline helpers ─────────────────────────────────────────────────────

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getSeasonForMonth(year: number, monthIdx: number, seasons: SeasonalRate[], propertyId: string) {
  const monthStart = new Date(year, monthIdx, 1);
  const monthEnd = new Date(year, monthIdx + 1, 0);
  const filtered = seasons.filter(s => {
    const pid = typeof s.property === 'string' ? s.property : s.property._id;
    return !propertyId || propertyId === 'all' || pid === propertyId;
  });
  for (const season of filtered) {
    for (const dr of season.dateRanges) {
      const start = new Date(dr.startDate);
      const end = new Date(dr.endDate);
      if (monthStart <= end && monthEnd >= start) return season;
    }
  }
  return null;
}

// ─── Numeric input helper ─────────────────────────────────────────────────────

function RateInput({ value, onChange, placeholder }: { value: number | null | undefined; onChange: (v: number | null) => void; placeholder?: string }) {
  return (
    <Input
      type="number"
      min={0}
      step={1}
      placeholder={placeholder ?? 'N/A'}
      value={value ?? ''}
      onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
      className="h-9 text-sm"
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminRateCalendar() {
  const { properties } = useBackendProperties();
  const [filterPropertyId, setFilterPropertyId] = useState('all');
  const { rates, loading, createRate, updateRate, deleteRate, fetchRates } = useSeasonalRates();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const displayYear = new Date().getFullYear();

  // Seasons filtered by property selector
  const filteredRates = useMemo(() =>
    filterPropertyId && filterPropertyId !== 'all'
      ? rates.filter(r => {
          const pid = typeof r.property === 'string' ? r.property : r.property._id;
          return pid === filterPropertyId;
        })
      : rates,
    [rates, filterPropertyId]
  );

  // ── Form helpers ──────────────────────────────────────────────────────────

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, propertyId: filterPropertyId === 'all' ? '' : filterPropertyId });
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (season: SeasonalRate) => {
    const pid = typeof season.property === 'string' ? season.property : season.property._id;
    setForm({
      propertyId: pid,
      name: season.name,
      seasonType: season.seasonType,
      dateRanges: season.dateRanges.map(dr => ({
        startDate: dr.startDate.split('T')[0],
        endDate: dr.endDate.split('T')[0],
      })),
      availableMealPlans: [...season.availableMealPlans],
      rates: season.rates.map(r => ({ ...r })),
      minNights: season.minNights ?? 1,
      isActive: season.isActive,
    });
    setEditingId(season._id);
    setDialogOpen(true);
  };

  const setFormField = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm(f => ({ ...f, [key]: val }));

  const toggleMealPlan = (plan: MealPlan) => {
    setForm(f => ({
      ...f,
      availableMealPlans: f.availableMealPlans.includes(plan)
        ? f.availableMealPlans.filter(p => p !== plan)
        : [...f.availableMealPlans, plan],
    }));
  };

  const setDateRange = (idx: number, field: keyof DateRange, val: string) => {
    setForm(f => {
      const ranges = [...f.dateRanges];
      ranges[idx] = { ...ranges[idx], [field]: val };
      return { ...f, dateRanges: ranges };
    });
  };

  const addDateRange = () => setForm(f => ({ ...f, dateRanges: [...f.dateRanges, { ...EMPTY_DATE_RANGE }] }));
  const removeDateRange = (idx: number) => setForm(f => ({ ...f, dateRanges: f.dateRanges.filter((_, i) => i !== idx) }));

  const addRateRow = () => setForm(f => ({ ...f, rates: [...f.rates, { ...EMPTY_RATE_ENTRY }] }));
  const removeRateRow = (idx: number) => setForm(f => ({ ...f, rates: f.rates.filter((_, i) => i !== idx) }));

  const setRateField = (idx: number, field: keyof RateEntry, val: string | number | null) => {
    setForm(f => {
      const rows = [...f.rates];
      rows[idx] = { ...rows[idx], [field]: val };
      return { ...f, rates: rows };
    });
  };

  // Populate rate rows from property rooms when property changes
  const handlePropertyChange = (propId: string) => {
    const prop = properties.find(p => (p.id || p._id) === propId);
    if (prop?.rooms?.length) {
      const seen = new Set<string>();
      const rows: RateEntry[] = [];
      for (const room of prop.rooms) {
        if (!seen.has(room.name)) {
          seen.add(room.name);
          rows.push({ roomType: room.name, sglBB: null, dblBB: null, sglHB: null, dblHB: null });
        }
      }
      setForm(f => ({ ...f, propertyId: propId, rates: rows }));
    } else {
      setFormField('propertyId', propId);
    }
  };

  const handleSave = async () => {
    if (!form.propertyId) { toast.error('Select a property'); return; }
    if (!form.name.trim()) { toast.error('Season name is required'); return; }
    if (form.dateRanges.some(dr => !dr.startDate || !dr.endDate)) { toast.error('All date ranges need start and end dates'); return; }
    if (form.availableMealPlans.length === 0) { toast.error('Select at least one meal plan'); return; }

    try {
      setSaving(true);
      const payload = {
        property: form.propertyId,
        name: form.name,
        seasonType: form.seasonType,
        dateRanges: form.dateRanges,
        availableMealPlans: form.availableMealPlans,
        rates: form.rates,
        minNights: form.minNights,
        isActive: form.isActive,
      };
      if (editingId) {
        await updateRate(editingId, payload);
        toast.success('Season updated');
      } else {
        await createRate(payload as SeasonalRate);
        toast.success('Season created');
      }
      setDialogOpen(false);
      fetchRates();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save season');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRate(id);
      toast.success('Season deleted');
      setDeleteConfirmId(null);
    } catch {
      toast.error('Failed to delete season');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Rate Calendar</h1>
              <p className="text-sm text-gray-500">Manage seasonal pricing for properties</p>
            </div>
          </div>
          <Button onClick={openCreate} className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="h-4 w-4 mr-2" /> Add Season
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Property filter */}
        <div className="flex items-center gap-4">
          <Label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by property:</Label>
          <Select value={filterPropertyId} onValueChange={setFilterPropertyId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="All properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All properties</SelectItem>
              {properties.map(p => (
                <SelectItem key={p.id || p._id} value={(p.id || p._id)!}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ── Year Timeline ─────────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-green-600" />
              {displayYear} Season Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-12 gap-1">
              {MONTH_NAMES.map((month, idx) => {
                const season = getSeasonForMonth(displayYear, idx, filteredRates, filterPropertyId);
                const colors = season ? SEASON_COLORS[season.seasonType] : null;
                return (
                  <div key={month} className="text-center">
                    <div
                      className={`rounded py-3 text-xs font-medium transition-colors ${
                        colors
                          ? `${colors.bg} ${colors.text} border ${colors.border}`
                          : 'bg-gray-100 text-gray-400 border border-gray-200'
                      }`}
                    >
                      {month}
                    </div>
                    {season && (
                      <p className="text-[9px] text-gray-500 mt-1 leading-tight">{SEASON_LABELS[season.seasonType]}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4">
              {(['low', 'high', 'peak'] as SeasonType[]).map(type => {
                const c = SEASON_COLORS[type];
                return (
                  <div key={type} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded-sm ${c.bg} border ${c.border}`} />
                    <span className="text-xs text-gray-600">{SEASON_LABELS[type]}</span>
                  </div>
                );
              })}
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-200" />
                <span className="text-xs text-gray-400">No season defined</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Season Cards ──────────────────────────────────────────────────── */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading seasons…</div>
        ) : filteredRates.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No seasons defined yet</p>
              <p className="text-sm text-gray-400 mb-4">Add your first season to start managing rates.</p>
              <Button onClick={openCreate} variant="outline">
                <Plus className="h-4 w-4 mr-2" /> Add Season
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRates.map(season => {
              const colors = SEASON_COLORS[season.seasonType];
              const propName = typeof season.property === 'string' ? season.property : season.property.name;
              const lowestBB = getLowestRate(season, 'BB');
              const lowestHB = getLowestRate(season, 'HB');
              const isExpanded = expandedId === season._id;

              return (
                <Card key={season._id} className={`border-l-4 ${colors.border.replace('border', 'border-l')}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge className={`${colors.bg} ${colors.text} border ${colors.border}`}>
                          {SEASON_LABELS[season.seasonType]}
                        </Badge>
                        <h3 className="font-semibold text-gray-900">{season.name}</h3>
                        <span className="text-sm text-gray-500">{propName}</span>
                        {!season.isActive && (
                          <Badge variant="outline" className="text-gray-400 border-gray-300">Inactive</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(season)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {deleteConfirmId === season._id ? (
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(season._id)}>
                              <Check className="h-3 w-3 mr-1" /> Confirm
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setDeleteConfirmId(null)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700"
                            onClick={() => setDeleteConfirmId(season._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => setExpandedId(isExpanded ? null : season._id)}>
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Date ranges summary */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {season.dateRanges.map((dr, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {format(parseISO(dr.startDate), 'd MMM yyyy')} → {format(parseISO(dr.endDate), 'd MMM yyyy')}
                        </span>
                      ))}
                    </div>

                    {/* Meal plans + min nights + from price */}
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <div className="flex gap-1">
                        {season.availableMealPlans.map(plan => (
                          <Badge key={plan} variant="outline" className="text-xs">{MEAL_PLAN_LABELS[plan]}</Badge>
                        ))}
                      </div>
                      {(season.minNights ?? 1) > 1 && (
                        <Badge variant="outline" className="text-xs border-orange-300 text-orange-700 bg-orange-50">
                          Min {season.minNights} nights
                        </Badge>
                      )}
                      <div className="flex items-center gap-3 text-sm">
                        {(() => {
                          const mn = season.minNights ?? 1;
                          const suffix = mn > 1 ? `/ ${mn} nights` : '/ night';
                          return (
                            <>
                              {lowestBB != null && (
                                <span className="text-gray-600">
                                  <DollarSign className="h-3 w-3 inline text-blue-500" />
                                  B&B from <strong className="text-blue-700">${mn > 1 ? lowestBB * mn : lowestBB}</strong>
                                  <span className="text-gray-400 text-xs"> {suffix}</span>
                                </span>
                              )}
                              {lowestHB != null && (
                                <span className="text-gray-600">
                                  <DollarSign className="h-3 w-3 inline text-amber-500" />
                                  HB from <strong className="text-amber-700">${mn > 1 ? lowestHB * mn : lowestHB}</strong>
                                  <span className="text-gray-400 text-xs"> {suffix}</span>
                                </span>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </CardHeader>

                  {/* Expandable rates table */}
                  {isExpanded && season.rates.length > 0 && (
                    <CardContent className="pt-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="bg-gray-50 text-left">
                              <th className="px-3 py-2 font-medium text-gray-600 border border-gray-200">Room Type</th>
                              <th className="px-3 py-2 font-medium text-blue-600 border border-gray-200">SGL B&B</th>
                              <th className="px-3 py-2 font-medium text-blue-600 border border-gray-200">DBL B&B</th>
                              <th className="px-3 py-2 font-medium text-amber-600 border border-gray-200">SGL HB</th>
                              <th className="px-3 py-2 font-medium text-amber-600 border border-gray-200">DBL HB</th>
                            </tr>
                          </thead>
                          <tbody>
                            {season.rates.map((row, i) => (
                              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="px-3 py-2 font-medium text-gray-800 border border-gray-200">{row.roomType}</td>
                                {(['sglBB', 'dblBB', 'sglHB', 'dblHB'] as const).map(field => (
                                  <td key={field} className="px-3 py-2 border border-gray-200 text-center">
                                    {row[field] != null ? (
                                      <span className="font-medium text-gray-800">${row[field]}</span>
                                    ) : (
                                      <span className="text-gray-300">N/A</span>
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  )}
                  {isExpanded && season.rates.length === 0 && (
                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-400 italic">No room rates defined for this season.</p>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Add / Edit Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={open => !saving && setDialogOpen(open)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Season' : 'Add New Season'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-2">

            {/* Property */}
            <div>
              <Label>Property <span className="text-red-500">*</span></Label>
              <Select value={form.propertyId} onValueChange={handlePropertyChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select property…" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map(p => (
                    <SelectItem key={p.id || p._id} value={(p.id || p._id)!}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Name + Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Season Name <span className="text-red-500">*</span></Label>
                <Input
                  className="mt-1"
                  placeholder="e.g. Peak Season 2026"
                  value={form.name}
                  onChange={e => setFormField('name', e.target.value)}
                />
              </div>
              <div>
                <Label>Season Type <span className="text-red-500">*</span></Label>
                <Select value={form.seasonType} onValueChange={v => setFormField('seasonType', v as SeasonType)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Season</SelectItem>
                    <SelectItem value="high">High Season</SelectItem>
                    <SelectItem value="peak">Peak Season</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date Ranges */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Date Ranges <span className="text-red-500">*</span></Label>
                <Button type="button" size="sm" variant="outline" onClick={addDateRange}>
                  <Plus className="h-3 w-3 mr-1" /> Add Range
                </Button>
              </div>
              <p className="text-xs text-gray-400 mb-3">Add multiple ranges for seasons that span non-consecutive periods (e.g. Peak season May–Sep and Dec–Jan).</p>
              <div className="space-y-3">
                {form.dateRanges.map((dr, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-gray-500">Start Date</Label>
                        <Input
                          type="date"
                          className="mt-1"
                          value={dr.startDate}
                          onChange={e => setDateRange(idx, 'startDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">End Date</Label>
                        <Input
                          type="date"
                          className="mt-1"
                          value={dr.endDate}
                          onChange={e => setDateRange(idx, 'endDate', e.target.value)}
                        />
                      </div>
                    </div>
                    {form.dateRanges.length > 1 && (
                      <Button type="button" size="sm" variant="ghost" className="text-red-400 mt-5" onClick={() => removeDateRange(idx)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Minimum Night Stay */}
            <div>
              <Label>Minimum Night Stay</Label>
              <p className="text-xs text-gray-400 mt-0.5 mb-2">Price will display as total for the minimum stay (e.g. $1380 / 4 nights).</p>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={1}
                  max={30}
                  className="w-28"
                  value={form.minNights}
                  onChange={e => setFormField('minNights', Math.max(1, parseInt(e.target.value) || 1))}
                />
                <span className="text-sm text-gray-500">night{form.minNights !== 1 ? 's' : ''} minimum</span>
              </div>
            </div>

            {/* Meal Plans */}
            <div>
              <Label className="mb-2 block">Available Meal Plans <span className="text-red-500">*</span></Label>
              <p className="text-xs text-gray-400 mb-3">During High & Peak season only HB is typically offered.</p>
              <div className="flex gap-3">
                {(['BB', 'HB', 'FB'] as MealPlan[]).map(plan => (
                  <label key={plan} className={`flex items-center gap-2 px-4 py-2 border rounded cursor-pointer transition-colors ${
                    form.availableMealPlans.includes(plan)
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={form.availableMealPlans.includes(plan)}
                      onChange={() => toggleMealPlan(plan)}
                    />
                    {form.availableMealPlans.includes(plan) && <Check className="h-3.5 w-3.5" />}
                    <span className="text-sm font-medium">{plan}</span>
                    <span className="text-xs text-gray-400">{MEAL_PLAN_LABELS[plan]}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Room Rates Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <Label>Room Rates (USD per room per night)</Label>
                  <p className="text-xs text-gray-400 mt-0.5">SGL = 1 guest · DBL = 2+ guests · Leave blank for N/A</p>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={addRateRow}>
                  <Plus className="h-3 w-3 mr-1" /> Add Row
                </Button>
              </div>

              {form.rates.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded text-gray-400 text-sm">
                  {form.propertyId
                    ? 'No room types found. Click "Add Row" to enter rates manually.'
                    : 'Select a property above to auto-populate room types.'}
                </div>
              ) : (
                <div className="border rounded overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Room Type</th>
                        <th className="px-3 py-2 text-center font-medium text-blue-600">SGL B&B</th>
                        <th className="px-3 py-2 text-center font-medium text-blue-600">DBL B&B</th>
                        <th className="px-3 py-2 text-center font-medium text-amber-600">SGL HB</th>
                        <th className="px-3 py-2 text-center font-medium text-amber-600">DBL HB</th>
                        <th className="px-2 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.rates.map((row, idx) => (
                        <tr key={idx} className="border-t border-gray-100">
                          <td className="px-3 py-2">
                            <Input
                              placeholder="Room type name"
                              value={row.roomType}
                              onChange={e => setRateField(idx, 'roomType', e.target.value)}
                              className="h-9 text-sm"
                            />
                          </td>
                          <td className="px-2 py-2 w-24">
                            <RateInput value={row.sglBB} onChange={v => setRateField(idx, 'sglBB', v)} />
                          </td>
                          <td className="px-2 py-2 w-24">
                            <RateInput value={row.dblBB} onChange={v => setRateField(idx, 'dblBB', v)} />
                          </td>
                          <td className="px-2 py-2 w-24">
                            <RateInput value={row.sglHB} onChange={v => setRateField(idx, 'sglHB', v)} />
                          </td>
                          <td className="px-2 py-2 w-24">
                            <RateInput value={row.dblHB} onChange={v => setRateField(idx, 'dblHB', v)} />
                          </td>
                          <td className="px-1 py-2">
                            <Button type="button" size="sm" variant="ghost" className="text-red-400 h-9 w-9 p-0"
                              onClick={() => removeRateRow(idx)}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Active toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setFormField('isActive', !form.isActive)}
                className={`w-10 h-5 rounded-full transition-colors relative ${form.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm text-gray-700">Season is active</span>
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white min-w-24">
              {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Season'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
