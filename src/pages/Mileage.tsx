import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Navigation, Circle, Square, Car, MapPin, Calendar, PoundSterling, ChevronRight, Search, X, Trash2, Loader2 } from 'lucide-react';
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
import BottomNav from '@/components/BottomNav';
import { useMileageTrips, calculateDeduction } from '@/hooks/useMileageTrips';
import { toast } from 'sonner';

const Mileage = () => {
  const navigate = useNavigate();
  const {
    trips,
    isLoading,
    addTrip,
    isAdding,
    deleteTrip,
    isDeleting,
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

  const [newTrip, setNewTrip] = useState({
    distance: '',
    type: 'business' as 'business' | 'personal',
    from: '',
    to: '',
    purpose: '',
    date: new Date().toISOString().split('T')[0],
  });

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

    const distance = parseFloat(newTrip.distance);
    if (isNaN(distance) || distance <= 0) {
      toast.error("Please enter a valid distance.");
      return;
    }

    addTrip({
      trip_date: newTrip.date,
      distance_miles: distance,
      trip_type: newTrip.type,
      origin: newTrip.from,
      destination: newTrip.to,
      purpose: newTrip.purpose || undefined,
    });

    setShowAddModal(false);
    setNewTrip({ 
      distance: '', 
      type: 'business', 
      from: '', 
      to: '', 
      purpose: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleDeleteTrip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTrip(id);
  };

  // Calculate preview deduction for new trip
  const previewDeduction = newTrip.type === 'business' && newTrip.distance
    ? calculateDeduction(parseFloat(newTrip.distance || '0'), ytdBusinessMiles)
    : 0;

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
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-foreground">{businessMiles.toFixed(1)}</div>
              <p className="text-sm text-muted-foreground mt-1">Business miles</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary">£{totalDeductions.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground mt-1">Tax savings</p>
            </CardContent>
          </Card>
        </div>

        {/* YTD Progress & Rate Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tax Year Progress</CardTitle>
            <CardDescription>
              {ytdBusinessMiles.toFixed(0)} / {THRESHOLD_MILES.toLocaleString()} miles at {(HMRC_RATE_FIRST_10K * 100).toFixed(0)}p rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={(ytdBusinessMiles / THRESHOLD_MILES) * 100} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Current rate: {(currentRate * 100).toFixed(0)}p/mile</span>
              {milesUntilRateChange > 0 ? (
                <span>{milesUntilRateChange.toFixed(0)} miles until {(HMRC_RATE_AFTER_10K * 100).toFixed(0)}p rate</span>
              ) : (
                <span className="text-amber-600">Now at reduced rate</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* This Month */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">This Month</CardTitle>
            <CardDescription>{thisMonthMiles.toFixed(1)} miles tracked</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={(thisMonthMiles / 500) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              £{(thisMonthMiles * currentRate).toFixed(2)} in potential deductions
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            {!isTracking ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
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
                  >
                    <Circle className="mr-2 h-4 w-4 fill-current" />
                    Start Tracking
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowAddModal(true)}
                    className="flex-1"
                  >
                    Add Manually
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
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
            <CardTitle className="text-base">Recent Trips</CardTitle>
            <CardDescription>Your logged journeys</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Search and Filters */}
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
                  className="cursor-pointer"
                  onClick={() => setTripTypeFilter('all')}
                >
                  All
                </Badge>
                <Badge
                  variant={tripTypeFilter === 'business' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setTripTypeFilter('business')}
                >
                  Business
                </Badge>
                <Badge
                  variant={tripTypeFilter === 'personal' ? 'default' : 'outline'}
                  className="cursor-pointer"
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

            {filteredTrips.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Car className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No trips found</p>
                <p className="text-sm mt-1">
                  {trips.length === 0 ? 'Start tracking to log your first trip' : 'Try adjusting your search or filters'}
                </p>
              </div>
            ) : (
              filteredTrips.map((trip) => (
                <div 
                  key={trip.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card/50 hover:bg-accent/50 transition-colors group"
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
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {trip.purpose}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={trip.trip_type === 'business' ? 'default' : 'secondary'} className="flex-shrink-0">
                          {trip.trip_type}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => handleDeleteTrip(trip.id, e)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(trip.trip_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                      <span>{Number(trip.distance_miles).toFixed(1)} mi</span>
                      {trip.trip_type === 'business' && (
                        <span className="flex items-center gap-1 text-primary">
                          <PoundSterling className="h-3 w-3" />
                          {Number(trip.calculated_deduction).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* HMRC Rate Info */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <PoundSterling className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-foreground">HMRC Simplified Expense Rates</h4>
                <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                  <li>• First 10,000 business miles: <strong>45p per mile</strong></li>
                  <li>• Over 10,000 business miles: <strong>25p per mile</strong></li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />

      {/* Add Trip Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Journey</DialogTitle>
            <DialogDescription>
              Enter your trip details for MTD record keeping
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newTrip.date}
                onChange={(e) => setNewTrip({ ...newTrip, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="from">From *</Label>
              <Input
                id="from"
                placeholder="Starting location"
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
            <div className="space-y-2">
              <Label htmlFor="distance">Distance (miles) *</Label>
              <Input
                id="distance"
                type="number"
                step="0.1"
                placeholder="0.0"
                value={newTrip.distance}
                onChange={(e) => setNewTrip({ ...newTrip, distance: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose (optional)</Label>
              <Input
                id="purpose"
                placeholder="e.g. Client meeting, Site visit"
                value={newTrip.purpose}
                onChange={(e) => setNewTrip({ ...newTrip, purpose: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Trip Type</Label>
              <RadioGroup 
                value={newTrip.type} 
                onValueChange={(value: 'business' | 'personal') => setNewTrip({ ...newTrip, type: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="business" id="business" />
                  <Label htmlFor="business" className="font-normal">Business (tax deductible)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="personal" id="personal" />
                  <Label htmlFor="personal" className="font-normal">Personal</Label>
                </div>
              </RadioGroup>
            </div>
            {newTrip.type === 'business' && newTrip.distance && (
              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Estimated deduction</p>
                <p className="text-lg font-semibold text-primary">
                  £{previewDeduction.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  at {(currentRate * 100).toFixed(0)}p/mile (YTD: {ytdBusinessMiles.toFixed(0)} miles)
                </p>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setShowAddModal(false)} 
                className="flex-1"
                disabled={isAdding}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddTrip} 
                className="flex-1"
                disabled={isAdding}
              >
                {isAdding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Trip'
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
