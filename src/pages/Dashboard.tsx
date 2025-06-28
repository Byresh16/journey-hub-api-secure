
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { LogOut, Search, Calendar } from "lucide-react";

interface Bus {
  _id: string;
  busNumber: string;
  capacity: number;
  type: string;
  amenities: string[];
}

interface Route {
  _id: string;
  origin: string;
  destination: string;
  distance: number;
  estimatedTime: number;
}

interface Schedule {
  _id: string;
  bus: Bus;
  route: Route;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
}

const Dashboard = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [searchParams, setSearchParams] = useState({
    origin: "",
    destination: "",
    date: "",
  });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams(searchParams).toString();
      
      const response = await fetch(`/api/user/search-buses?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSchedules(data);
      } else {
        toast({
          title: "Search Failed",
          description: data.message || "Unable to search buses",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (scheduleId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/user/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          scheduleId,
          seats: 1,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Booking Successful",
          description: `Your booking ID is ${data.bookingId}`,
        });
        handleSearch(new Event("submit") as any);
      } else {
        toast({
          title: "Booking Failed",
          description: data.message || "Unable to book the bus",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Bus Booking Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Search Buses
            </CardTitle>
            <CardDescription>Find available buses for your journey</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Origin"
                value={searchParams.origin}
                onChange={(e) => setSearchParams({ ...searchParams, origin: e.target.value })}
                required
              />
              <Input
                placeholder="Destination"
                value={searchParams.destination}
                onChange={(e) => setSearchParams({ ...searchParams, destination: e.target.value })}
                required
              />
              <Input
                type="date"
                value={searchParams.date}
                onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                required
              />
              <Button type="submit" disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {schedules.map((schedule) => (
            <Card key={schedule._id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-lg font-semibold">{schedule.bus.busNumber}</h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {schedule.bus.type}
                      </span>
                    </div>
                    <p className="text-gray-600">
                      {schedule.route.origin} → {schedule.route.destination}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Departure: {new Date(schedule.departureTime).toLocaleTimeString()}</span>
                      <span>Arrival: {new Date(schedule.arrivalTime).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span>Available Seats: {schedule.availableSeats}</span>
                      <span>Amenities: {schedule.bus.amenities.join(", ")}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      ₹{schedule.price}
                    </div>
                    <Button
                      onClick={() => handleBooking(schedule._id)}
                      disabled={schedule.availableSeats === 0}
                    >
                      {schedule.availableSeats === 0 ? "Sold Out" : "Book Now"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {schedules.length === 0 && !loading && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No buses found. Try searching with different parameters.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
