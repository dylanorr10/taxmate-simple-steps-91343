import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Navigation, Circle, Square, Car, MapPin, Calendar, PoundSterling, ChevronRight } from 'lucide-react';
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

interface Trip {
  id: string;
  date: string;
  distance: number;
  type: 'business' | 'personal';
  from: string;
  to: string;
  deduction: number;
}

const HMRC_RATE = 0.45; // 45p per mile for first 10,000 miles

const Mileage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isTracking, setIsTracking] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([
    {
      id: '1',
      date: '2025-10-06',
      distance: 24.5,
      type: 'business',
      from: 'Office',
      to: 'Client Meeting - Central London',
      deduction: 11.03
    },
    {
      id: '2',
      date: '2025-10-05',
      distance: 18.2,
      type: 'business',
      from: 'Home',
      to: 'Supplier Visit',
      deduction: 8.19
    },
    {
      id: '3',
      date: '2025-10-04',
      distance: 42.0,
      type: 'personal',
      from: 'Home',
      to: 'Shopping',
      deduction: 0
    }
  ]);

  const [newTrip, setNewTrip] = useState({
    distance: '',
    type: 'business',
    from: '',
    to: ''
  });

  // Calculate stats
  const totalMiles = trips.reduce((sum, trip) => sum + trip.distance, 0);
  const businessMiles = trips.filter(t => t.type === 'business').reduce((sum, trip) => sum + trip.distance, 0);
  const totalDeductions = trips.filter(t => t.type === 'business').reduce((sum, trip) => sum + trip.deduction, 0);
  const thisMonthMiles = trips.filter(t => {
    const tripDate = new Date(t.date);
    const now = new Date();
    return tripDate.getMonth() === now.getMonth() && tripDate.getFullYear() === now.getFullYear();
  }).reduce((sum, trip) => sum + trip.distance, 0);

  const handleStartTracking = () => {
    if (!navigator.geolocation) {
      toast({
        title: "GPS not available",
        description: "Your device doesn't support GPS tracking.",
        variant: "destructive"
      });
      return;
    }

    setIsTracking(true);
    toast({
      title: "Tracking started",
      description: "Recording your journey...",
    });
  };

  const handleStopTracking = () => {
    setIsTracking(false);
    setShowAddModal(true);
    toast({
      title: "Journey complete",
      description: "Add details to save this trip.",
    });
  };

  const handleAddTrip = () => {
    if (!newTrip.distance || !newTrip.from || !newTrip.to) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    const distance = parseFloat(newTrip.distance);
    const deduction = newTrip.type === 'business' ? distance * HMRC_RATE : 0;

    const trip: Trip = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      distance,
      type: newTrip.type as 'business' | 'personal',
      from: newTrip.from,
      to: newTrip.to,
      deduction
    };

    setTrips([trip, ...trips]);
    setShowAddModal(false);
    setNewTrip({ distance: '', type: 'business', from: '', to: '' });
    
    toast({
      title: "Trip saved",
      description: `Added ${distance} miles${newTrip.type === 'business' ? ` (£${deduction.toFixed(2)} deduction)` : ''}`,
    });
  };

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

        {/* This Month Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">This Month</CardTitle>
            <CardDescription>{thisMonthMiles.toFixed(1)} miles tracked</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={(thisMonthMiles / 1000) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              £{(thisMonthMiles * HMRC_RATE).toFixed(2)} in potential deductions
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
            {trips.map((trip) => (
              <div 
                key={trip.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card/50 hover:bg-accent/50 transition-colors cursor-pointer"
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
                          {trip.from}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-muted-foreground truncate">
                          {trip.to}
                        </span>
                      </div>
                    </div>
                    <Badge variant={trip.type === 'business' ? 'default' : 'secondary'} className="flex-shrink-0">
                      {trip.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(trip.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                    <span>{trip.distance} mi</span>
                    {trip.type === 'business' && (
                      <span className="flex items-center gap-1 text-primary">
                        <PoundSterling className="h-3 w-3" />
                        {trip.deduction.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
                <h4 className="text-sm font-medium text-foreground">HMRC Approved Rates</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  45p per mile for the first 10,000 miles, then 25p per mile thereafter
                </p>
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
              Enter your trip details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="from">From</Label>
              <Input
                id="from"
                placeholder="Starting location"
                value={newTrip.from}
                onChange={(e) => setNewTrip({ ...newTrip, from: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Input
                id="to"
                placeholder="Destination"
                value={newTrip.to}
                onChange={(e) => setNewTrip({ ...newTrip, to: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="distance">Distance (miles)</Label>
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
              <Label>Trip Type</Label>
              <RadioGroup value={newTrip.type} onValueChange={(value) => setNewTrip({ ...newTrip, type: value })}>
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
                  £{(parseFloat(newTrip.distance || '0') * HMRC_RATE).toFixed(2)}
                </p>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddTrip} className="flex-1">
                Save Trip
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Mileage;
