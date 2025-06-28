
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { LogOut, Plus, Bus, MapPin, Calendar } from "lucide-react";

const AdminDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== "admin") {
        navigate("/dashboard");
        return;
      }
      setUser(parsedUser);
    } else {
      navigate("/login");
    }
  }, [navigate]);

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
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
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
        <Tabs defaultValue="buses" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="buses">Bus Management</TabsTrigger>
            <TabsTrigger value="routes">Route Management</TabsTrigger>
            <TabsTrigger value="schedules">Schedule Management</TabsTrigger>
          </TabsList>

          <TabsContent value="buses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bus className="w-5 h-5 mr-2" />
                  Add New Bus
                </CardTitle>
                <CardDescription>Register a new bus in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <BusForm />
              </CardContent>
            </Card>
            <BusList />
          </TabsContent>

          <TabsContent value="routes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Add New Route
                </CardTitle>
                <CardDescription>Create a new route between cities</CardDescription>
              </CardHeader>
              <CardContent>
                <RouteForm />
              </CardContent>
            </Card>
            <RoutesList />
          </TabsContent>

          <TabsContent value="schedules" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Add New Schedule
                </CardTitle>
                <CardDescription>Schedule a bus for a specific route</CardDescription>
              </CardHeader>
              <CardContent>
                <ScheduleForm />
              </CardContent>
            </Card>
            <SchedulesList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

// Bus Form Component
const BusForm = () => {
  const [formData, setFormData] = useState({
    busNumber: "",
    capacity: "",
    type: "AC",
    amenities: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/buses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          capacity: parseInt(formData.capacity),
          amenities: formData.amenities.split(",").map(a => a.trim()),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Bus Added Successfully",
          description: `Bus ${formData.busNumber} has been registered`,
        });
        setFormData({ busNumber: "", capacity: "", type: "AC", amenities: "" });
      } else {
        toast({
          title: "Failed to Add Bus",
          description: data.message || "Something went wrong",
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

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        placeholder="Bus Number"
        value={formData.busNumber}
        onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
        required
      />
      <Input
        type="number"
        placeholder="Capacity"
        value={formData.capacity}
        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
        required
      />
      <select
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        required
      >
        <option value="AC">AC</option>
        <option value="Non-AC">Non-AC</option>
        <option value="Sleeper">Sleeper</option>
        <option value="Semi-Sleeper">Semi-Sleeper</option>
      </select>
      <Input
        placeholder="Amenities (comma separated)"
        value={formData.amenities}
        onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
      />
      <Button type="submit" disabled={loading} className="md:col-span-2">
        {loading ? "Adding..." : "Add Bus"}
      </Button>
    </form>
  );
};

// Route Form Component
const RouteForm = () => {
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    distance: "",
    estimatedTime: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/routes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          distance: parseFloat(formData.distance),
          estimatedTime: parseInt(formData.estimatedTime),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Route Added Successfully",
          description: `Route from ${formData.origin} to ${formData.destination} has been created`,
        });
        setFormData({ origin: "", destination: "", distance: "", estimatedTime: "" });
      } else {
        toast({
          title: "Failed to Add Route",
          description: data.message || "Something went wrong",
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

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        placeholder="Origin City"
        value={formData.origin}
        onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
        required
      />
      <Input
        placeholder="Destination City"
        value={formData.destination}
        onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
        required
      />
      <Input
        type="number"
        step="0.1"
        placeholder="Distance (km)"
        value={formData.distance}
        onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
        required
      />
      <Input
        type="number"
        placeholder="Estimated Time (minutes)"
        value={formData.estimatedTime}
        onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
        required
      />
      <Button type="submit" disabled={loading} className="md:col-span-2">
        {loading ? "Adding..." : "Add Route"}
      </Button>
    </form>
  );
};

// Schedule Form Component
const ScheduleForm = () => {
  const [formData, setFormData] = useState({
    busId: "",
    routeId: "",
    departureTime: "",
    price: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Schedule Added Successfully",
          description: "New bus schedule has been created",
        });
        setFormData({ busId: "", routeId: "", departureTime: "", price: "" });
      } else {
        toast({
          title: "Failed to Add Schedule",
          description: data.message || "Something went wrong",
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

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        placeholder="Bus ID"
        value={formData.busId}
        onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
        required
      />
      <Input
        placeholder="Route ID"
        value={formData.routeId}
        onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
        required
      />
      <Input
        type="datetime-local"
        value={formData.departureTime}
        onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
        required
      />
      <Input
        type="number"
        step="0.01"
        placeholder="Price (₹)"
        value={formData.price}
        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        required
      />
      <Button type="submit" disabled={loading} className="md:col-span-2">
        {loading ? "Adding..." : "Add Schedule"}
      </Button>
    </form>
  );
};

// Placeholder list components
const BusList = () => (
  <Card>
    <CardHeader>
      <CardTitle>Registered Buses</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-500">Bus list will be displayed here</p>
    </CardContent>
  </Card>
);

const RoutesList = () => (
  <Card>
    <CardHeader>
      <CardTitle>Available Routes</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-500">Routes list will be displayed here</p>
    </CardContent>
  </Card>
);

const SchedulesList = () => (
  <Card>
    <CardHeader>
      <CardTitle>Bus Schedules</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-500">Schedules list will be displayed here</p>
    </CardContent>
  </Card>
);

export default AdminDashboard;
