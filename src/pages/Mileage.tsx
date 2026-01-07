import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Navigation, Circle, Square, Car, MapPin, Calendar, PoundSterling, ChevronRight, Search, X, Trash2, Loader2, Download, RotateCcw, Briefcase, Users, Wrench, Building2, Edit2, Check, ArrowRightLeft, TrendingUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import BottomNav from '@/components/BottomNav';
import { useMileageTrips, calculateDeduction, MileageTrip } from '@/hooks/useMileageTrips';
import { toast } from 'sonner';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

// Quick purpose presets
const PURPOSE_PRESETS = [
  { label: 'Client Meeting', icon: Users },
  { label: 'Site Visit', icon: Building2 },
  { label: 'Supplier Visit', icon: Briefcase },
  { label: 'Service/Repair', icon: Wrench },
];

const Mileage = () => {
  const navigate = useNavigate();
  const {
    trips,
    isLoading,
    addTrip,
    isAdding,
    deleteTrip,
    isDeleting,
    updateTrip,
    isUpdating,
    businessMiles,
    totalDeductions,
    thisMonthMiles,
    ytdBusinessMiles,
    currentRate,
    milesUntilRateChange,
    HMRC_RATE_FIRST_10K,
    HMRC_RATE_AFTER_10K,
    THRESHOLD_MILES,
  } = useMileageTrips();

  const [isTracking, setIsTracking] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tripTypeFilter, setTripTypeFilter] = useState<'all' | 'business' | 'personal'>('all');
  const [editingTrip, setEditingTrip] = useState<MileageTrip | null>(null);

  const [newTrip, setNewTrip] = useState({
    distance: '',
    type: 'business' as 'business' | 'personal',
    from: '',
    to: '',
    purpose: '',
    date: new Date().toISOString().split('T')[0],
    isRoundTrip: false,
  });

  // Calculate monthly breakdown for last 3 months
  const monthlyBreakdown = useMemo(() => {
    const now = new Date();
    return [0, 1, 2].map(monthsAgo => {
      const targetMonth = subMonths(now, monthsAgo);
      const start = startOfMonth(targetMonth);
      const end = endOfMonth(targetMonth);
      
      const monthTrips = trips.filter(t => {
        const tripDate = new Date(t.trip_date);
        return isWithinInterval(tripDate, { start, end }) && t.trip_type === 'business';
      });
      
      const miles = monthTrips.reduce((sum, t) => sum + Number(t.distance_miles), 0);
      const deductions = monthTrips.reduce((sum, t) => sum + Number(t.calculated_deduction), 0);
      
      return {
        month: format(targetMonth, 'MMM'),
        miles,
        deductions,
        tripCount: monthTrips.length,
      };
    }).reverse();
  }, [trips]);

  // Filter trips based on search and filters
  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          (trip.origin?.toLowerCase().includes(query)) ||
          (trip.destination?.toLowerCase().includes(query)) ||
          (trip.purpose?.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }
      
      if (tripTypeFilter !== 'all' && trip.trip_type !== tripTypeFilter) {
        return false;
      }
      
      return true;
    });
  }, [trips, searchQuery, tripTypeFilter]);

  const handleStartTracking = () => {
    if (!navigator.geolocation) {
      toast.error("Your device doesn't support GPS tracking.");
      return;
    }

    setIsTracking(true);
    toast.info("Recording your journey...");
  };

  const handleStopTracking = () => {
    setIsTracking(false);
    setShowAddModal(true);
    toast.info("Add details to save this trip.");
  };

  const handleAddTrip = () => {
    if (!newTrip.distance || !newTrip.from || !newTrip.to) {
      toast.error("Please fill in all required fields.");
      return;
    }

    let distance = parseFloat(newTrip.distance);
    if (isNaN(distance) || distance <= 0) {
      toast.error("Please enter a valid distance.");
      return;
    }

    // Double distance for round trips
    if (newTrip.isRoundTrip) {
      distance *= 2;
    }

    addTrip({
      trip_date: newTrip.date,
      distance_miles: distance,
      trip_type: newTrip.type,
      origin: newTrip.from,
      destination: newTrip.isRoundTrip ? `${newTrip.to} (round trip)` : newTrip.to,
      purpose: newTrip.purpose || undefined,
    });

    setShowAddModal(false);
    resetNewTrip();
  };

  const resetNewTrip = () => {
    setNewTrip({ 
      distance: '', 
      type: 'business', 
      from: '', 
      to: '', 
      purpose: '',
      date: new Date().toISOString().split('T')[0],
      isRoundTrip: false,
    });
  };

  const handleEditTrip = (trip: MileageTrip) => {
    setEditingTrip(trip);
    setNewTrip({
      distance: String(trip.distance_miles),
      type: trip.trip_type,
      from: trip.origin || '',
      to: trip.destination || '',
      purpose: trip.purpose || '',
      date: trip.trip_date,
      isRoundTrip: false,
    });
    setShowAddModal(true);
  };

  const handleUpdateTrip = () => {
    if (!editingTrip || !newTrip.distance || !newTrip.from || !newTrip.to) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const distance = parseFloat(newTrip.distance);
    if (isNaN(distance) || distance <= 0) {
      toast.error("Please enter a valid distance.");
      return;
    }

    updateTrip({
      id: editingTrip.id,
      trip_date: newTrip.date,
      distance_miles: distance,
      trip_type: newTrip.type,
      origin: newTrip.from,
      destination: newTrip.to,
      purpose: newTrip.purpose || null,
    });

    setShowAddModal(false);
    setEditingTrip(null);
    resetNewTrip();
  };

  const handleDeleteTrip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTrip(id);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingTrip(null);
    resetNewTrip();
  };

  // Export trips to CSV
  const handleExportCSV = () => {
    const businessTrips = trips.filter(t => t.trip_type === 'business');
    if (businessTrips.length === 0) {
      toast.error("No business trips to export.");
      return;
    }

    const headers = ['Date', 'From', 'To', 'Purpose', 'Distance (miles)', 'Deduction (£)'];
    const rows = businessTrips.map(t => [
      t.trip_date,
      t.origin || '',
      t.destination || '',
      t.purpose || '',
      Number(t.distance_miles).toFixed(1),
      Number(t.calculated_deduction).toFixed(2),
    ]);

    // Add totals row
    rows.push([]);
    rows.push(['TOTALS', '', '', '', 
      businessTrips.reduce((s, t) => s + Number(t.distance_miles), 0).toFixed(1),
      businessTrips.reduce((s, t) => s + Number(t.calculated_deduction), 0).toFixed(2),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mileage-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Mileage log exported!");
  };

  // Calculate preview deduction for new trip
  const previewDistance = newTrip.isRoundTrip ? parseFloat(newTrip.distance || '0') * 2 : parseFloat(newTrip.distance || '0');
  const previewDeduction = newTrip.type === 'business' && newTrip.distance
    ? calculateDeduction(previewDistance, ytdBusinessMiles)
    : 0;

  // Max value for monthly chart scaling
  const maxMonthlyMiles = Math.max(...monthlyBreakdown.map(m => m.miles), 100);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">Mileage Tracker</h1>
            <p className="text-sm text-muted-foreground">Track and claim your journeys</p>
          </div>
          {trips.length > 0 && (
            <Button variant="outline" size="icon" onClick={handleExportCSV}>
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Business miles</span>
              </div>
              <div className="text-3xl font-bold text-foreground mt-2">{businessMiles.toFixed(0)}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <PoundSterling className="h-5 w-5 text-emerald-600" />
                <span className="text-sm text-muted-foreground">Tax savings</span>
              </div>
              <div className="text-3xl font-bold text-emerald-600 mt-2">£{totalDeductions.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Breakdown Chart */}
        {trips.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Monthly Breakdown
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-4 h-24">
                {monthlyBreakdown.map((month, i) => (
                  <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-xs text-muted-foreground">
                      £{month.deductions.toFixed(0)}
                    </div>
                    <div className="w-full bg-muted rounded-t-sm relative" style={{ height: '60px' }}>
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-sm transition-all"
                        style={{ height: `${(month.miles / maxMonthlyMiles) * 100}%`, minHeight: month.miles > 0 ? '4px' : '0' }}
                      />
                    </div>
                    <div className="text-xs font-medium">{month.month}</div>
                    <div className="text-xs text-muted-foreground">{month.miles.toFixed(0)} mi</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* YTD Progress & Rate Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tax Year Progress</CardTitle>
            <CardDescription>
              {ytdBusinessMiles.toFixed(0)} / {THRESHOLD_MILES.toLocaleString()} miles at {(HMRC_RATE_FIRST_10K * 100).toFixed(0)}p rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={(ytdBusinessMiles / THRESHOLD_MILES) * 100} className="h-3" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs px-1.5 py-0">
                  {(currentRate * 100).toFixed(0)}p/mi
                </Badge>
                current rate
              </span>
              {milesUntilRateChange > 0 ? (
                <span>{milesUntilRateChange.toLocaleString()} miles until {(HMRC_RATE_AFTER_10K * 100).toFixed(0)}p rate</span>
              ) : (
                <Badge variant="secondary" className="text-amber-600 bg-amber-100">Reduced rate</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-primary/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <CardContent className="pt-6 relative">
            {!isTracking ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto ring-4 ring-primary/5">
                  <Navigation className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Ready to track</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start recording your journey automatically
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleStartTracking}
                    className="flex-1"
                    size="lg"
                  >
                    <Circle className="mr-2 h-4 w-4 fill-current" />
                    Start Tracking
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowAddModal(true)}
                    className="flex-1"
                    size="lg"
                  >
                    Add Manually
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto animate-pulse ring-4 ring-destructive/20">
                  <Square className="h-6 w-6 text-destructive fill-current" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Tracking in progress</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Recording your journey...
                  </p>
                </div>
                <Button 
                  onClick={handleStopTracking}
                  variant="destructive"
                  className="w-full"
                  size="lg"
                >
                  <Square className="mr-2 h-4 w-4 fill-current" />
                  Stop & Save
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Trips */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Recent Trips</CardTitle>
                <CardDescription>Your logged journeys</CardDescription>
              </div>
              {trips.length > 0 && (
                <Badge variant="secondary">{trips.length} total</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Search and Filters */}
            {trips.length > 0 && (
              <div className="space-y-3 pb-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-9"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Badge
                    variant={tripTypeFilter === 'all' ? 'default' : 'outline'}
                    className="cursor-pointer transition-colors"
                    onClick={() => setTripTypeFilter('all')}
                  >
                    All
                  </Badge>
                  <Badge
                    variant={tripTypeFilter === 'business' ? 'default' : 'outline'}
                    className="cursor-pointer transition-colors"
                    onClick={() => setTripTypeFilter('business')}
                  >
                    Business
                  </Badge>
                  <Badge
                    variant={tripTypeFilter === 'personal' ? 'default' : 'outline'}
                    className="cursor-pointer transition-colors"
                    onClick={() => setTripTypeFilter('personal')}
                  >
                    Personal
                  </Badge>
                </div>
                
                {(searchQuery || tripTypeFilter !== 'all') && (
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredTrips.length} of {trips.length} trips
                  </p>
                )}
              </div>
            )}

            {filteredTrips.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Car className="h-8 w-8 opacity-50" />
                </div>
                <p className="font-medium">No trips found</p>
                <p className="text-sm mt-1">
                  {trips.length === 0 ? 'Start tracking to log your first trip' : 'Try adjusting your search or filters'}
                </p>
                {trips.length === 0 && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setShowAddModal(true)}
                  >
                    Add your first trip
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTrips.map((trip) => (
                  <div 
                    key={trip.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Car className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm font-medium text-foreground truncate">
                              {trip.origin || 'Unknown'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm text-muted-foreground truncate">
                              {trip.destination || 'Unknown'}
                            </span>
                          </div>
                          {trip.purpose && (
                            <p className="text-xs text-muted-foreground mt-1 truncate italic">
                              {trip.purpose}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant={trip.trip_type === 'business' ? 'default' : 'secondary'} className="flex-shrink-0">
                            {trip.trip_type}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleEditTrip(trip)}
                          >
                            <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => handleDeleteTrip(trip.id, e)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(trip.trip_date), 'd MMM yyyy')}
                        </span>
                        <span className="font-medium">{Number(trip.distance_miles).toFixed(1)} mi</span>
                        {trip.trip_type === 'business' && (
                          <span className="flex items-center gap-1 text-emerald-600 font-medium">
                            <PoundSterling className="h-3 w-3" />
                            {Number(trip.calculated_deduction).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* HMRC Rate Info */}
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <PoundSterling className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-foreground">HMRC Simplified Expense Rates</h4>
                <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                  <li className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">45p</Badge>
                    First 10,000 business miles
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">25p</Badge>
                    Over 10,000 business miles
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground mt-3">
                  These rates cover fuel, insurance, repairs, and depreciation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />

      {/* Add/Edit Trip Modal */}
      <Dialog open={showAddModal} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTrip ? 'Edit Journey' : 'Add Journey'}</DialogTitle>
            <DialogDescription>
              {editingTrip ? 'Update your trip details' : 'Enter your trip details for MTD record keeping'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newTrip.date}
                onChange={(e) => setNewTrip({ ...newTrip, date: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="from">From *</Label>
                <Input
                  id="from"
                  placeholder="Start location"
                  value={newTrip.from}
                  onChange={(e) => setNewTrip({ ...newTrip, from: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to">To *</Label>
                <Input
                  id="to"
                  placeholder="Destination"
                  value={newTrip.to}
                  onChange={(e) => setNewTrip({ ...newTrip, to: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="distance">Distance (miles) *</Label>
              <div className="flex gap-2">
                <Input
                  id="distance"
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={newTrip.distance}
                  onChange={(e) => setNewTrip({ ...newTrip, distance: e.target.value })}
                  className="flex-1"
                />
                {!editingTrip && (
                  <div className="flex items-center gap-2 px-3 border rounded-md bg-muted/50">
                    <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                    <Switch
                      checked={newTrip.isRoundTrip}
                      onCheckedChange={(checked) => setNewTrip({ ...newTrip, isRoundTrip: checked })}
                    />
                    <Label className="text-xs whitespace-nowrap">Round trip</Label>
                  </div>
                )}
              </div>
              {newTrip.isRoundTrip && newTrip.distance && (
                <p className="text-xs text-muted-foreground">
                  Total: {(parseFloat(newTrip.distance) * 2).toFixed(1)} miles
                </p>
              )}
            </div>

            {/* Quick purpose presets */}
            <div className="space-y-2">
              <Label>Purpose (optional)</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {PURPOSE_PRESETS.map((preset) => (
                  <Button
                    key={preset.label}
                    type="button"
                    variant={newTrip.purpose === preset.label ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setNewTrip({ ...newTrip, purpose: newTrip.purpose === preset.label ? '' : preset.label })}
                  >
                    <preset.icon className="h-3 w-3 mr-1" />
                    {preset.label}
                  </Button>
                ))}
              </div>
              <Input
                id="purpose"
                placeholder="Or enter custom purpose..."
                value={newTrip.purpose}
                onChange={(e) => setNewTrip({ ...newTrip, purpose: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Trip Type</Label>
              <RadioGroup 
                value={newTrip.type} 
                onValueChange={(value: 'business' | 'personal') => setNewTrip({ ...newTrip, type: value })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="business" id="business" />
                  <Label htmlFor="business" className="font-normal cursor-pointer">Business</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="personal" id="personal" />
                  <Label htmlFor="personal" className="font-normal cursor-pointer">Personal</Label>
                </div>
              </RadioGroup>
            </div>

            {newTrip.type === 'business' && newTrip.distance && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated deduction</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      £{previewDeduction.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{previewDistance.toFixed(1)} miles</p>
                    <p>at {(currentRate * 100).toFixed(0)}p/mile</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={handleCloseModal} 
                className="flex-1"
                disabled={isAdding || isUpdating}
              >
                Cancel
              </Button>
              <Button 
                onClick={editingTrip ? handleUpdateTrip : handleAddTrip} 
                className="flex-1"
                disabled={isAdding || isUpdating}
              >
                {(isAdding || isUpdating) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    {editingTrip ? 'Update' : 'Save Trip'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Mileage;
