import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { enhancements, Enhancement } from '@/data/packages';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus, Star } from 'lucide-react';

export default function Enhancements() {
  const groupedEnhancements = enhancements.reduce((acc, enhancement) => {
    if (!acc[enhancement.category]) {
      acc[enhancement.category] = [];
    }
    acc[enhancement.category].push(enhancement);
    return acc;
  }, {} as Record<string, Enhancement[]>);

  const categoryInfo = {
    activity: {
      title: 'Adventure Activities',
      description: 'Unique experiences to enhance your safari adventure',
      icon: '🎯'
    },
    accommodation: {
      title: 'Accommodation Upgrades',
      description: 'Luxury upgrades for the ultimate comfort',
      icon: '🏨'
    },
    transport: {
      title: 'Transportation',
      description: 'Premium transport options for maximum flexibility',
      icon: '🚗'
    },
    experience: {
      title: 'Cultural Experiences',
      description: 'Immerse yourself in local culture and traditions',
      icon: '🎭'
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&h=1080&fit=crop)'
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Badge className="bg-amber-600 text-white mb-4">Safari Enhancements</Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Enhance Your
            <span className="block text-amber-400">Safari Experience</span>
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Take your safari adventure to the next level with our carefully curated collection of premium activities, upgrades, and unique experiences
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Personalize Your Adventure</h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Every safari is unique, and our enhancements allow you to customize your experience to match your interests and preferences. From thrilling activities to luxury upgrades, create memories that will last a lifetime.
          </p>
        </div>
      </section>

      {/* Enhancement Categories */}
      {Object.entries(groupedEnhancements).map(([category, items]) => (
        <section key={category} className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="text-4xl mb-4">{categoryInfo[category as keyof typeof categoryInfo]?.icon}</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {categoryInfo[category as keyof typeof categoryInfo]?.title}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {categoryInfo[category as keyof typeof categoryInfo]?.description}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((enhancement) => (
                <Card key={enhancement.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={enhancement.image}
                      alt={enhancement.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-amber-600 text-white">
                        ${enhancement.price}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{enhancement.name}</h3>
                    <p className="text-gray-700 mb-4">{enhancement.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {enhancement.category}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Popular Combinations */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Popular Enhancement Combinations</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These carefully curated combinations offer exceptional value and unforgettable experiences
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-4xl mb-4">📸</div>
                <CardTitle>Photography Package</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">Perfect for photography enthusiasts</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Hot Air Balloon Safari</span>
                    <span>$550</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Private Safari Vehicle</span>
                    <span>$300</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Night Game Drive</span>
                    <span>$200</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold">
                    <span>Total Value: $1,050</span>
                  </div>
                  <div className="text-amber-600 font-bold">
                    Package Price: $900
                  </div>
                </div>
                <Badge className="bg-green-600">Save $150</Badge>
              </CardContent>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-4xl mb-4">🌅</div>
                <CardTitle>Luxury Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">Ultimate luxury and comfort</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Luxury Accommodation Upgrade</span>
                    <span>$400</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Private Safari Vehicle</span>
                    <span>$300</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hot Air Balloon Safari</span>
                    <span>$550</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold">
                    <span>Total Value: $1,250</span>
                  </div>
                  <div className="text-amber-600 font-bold">
                    Package Price: $1,050
                  </div>
                </div>
                <Badge className="bg-green-600">Save $200</Badge>
              </CardContent>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-4xl mb-4">🎭</div>
                <CardTitle>Cultural Immersion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">Connect with local culture</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Maasai Cultural Visit</span>
                    <span>$150</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Guided Walking Safari</span>
                    <span>$120</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Night Game Drive</span>
                    <span>$200</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold">
                    <span>Total Value: $470</span>
                  </div>
                  <div className="text-amber-600 font-bold">
                    Package Price: $400
                  </div>
                </div>
                <Badge className="bg-green-600">Save $70</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-amber-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Enhance Your Safari?</h2>
          <p className="text-xl text-amber-100 mb-8">
            Add these incredible experiences to your booking and create unforgettable memories
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/book">
              <Button size="lg" variant="secondary" className="bg-white text-amber-600 hover:bg-gray-100">
                <Plus className="mr-2 w-4 h-4" />
                Add to Booking
              </Button>
            </Link>
            <Link to="/packages">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-amber-600">
                View Packages
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}