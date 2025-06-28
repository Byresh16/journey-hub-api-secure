
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Bus, Users, Shield, Clock } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Bus className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">BusBooking</h1>
            </div>
            <div className="space-x-4">
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Register</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Book Your Journey with Ease
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover comfortable, reliable, and affordable bus travel across the country. 
            Book your tickets online and travel with confidence.
          </p>
          <div className="space-x-4">
            <Link to="/register">
              <Button size="lg" className="px-8 py-3">
                Get Started
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="px-8 py-3">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card>
            <CardHeader className="text-center">
              <Bus className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Wide Network</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Access to hundreds of routes connecting major cities and towns across the country.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Clock className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Real-time Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Get live updates on bus schedules, delays, and seat availability.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Secure Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Your personal and payment information is protected with advanced security measures.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>24/7 Support</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Our customer support team is available round the clock to assist you.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Your Journey?
          </h3>
          <p className="text-lg text-gray-600 mb-6">
            Join thousands of satisfied customers who trust us for their travel needs.
          </p>
          <Link to="/register">
            <Button size="lg" className="px-12 py-4 text-lg">
              Book Your First Trip
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Bus className="w-6 h-6" />
              <span className="text-xl font-semibold">BusBooking</span>
            </div>
            <p className="text-gray-400">
              © 2024 BusBooking. All rights reserved. Making travel simple and reliable.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
