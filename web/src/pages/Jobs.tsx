
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Calendar, MapPin, Building, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { getActiveJobs } from '@/utils/supabaseClient';

interface Job {
  id: string;
  title: string;
  company: string;
  location?: string;
  job_type: string;
  category?: string;
  salary?: string;
  description: string;
  requirements?: string;
  contact_email?: string;
  posted_at: string;
  status: string;
}

export function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await getActiveJobs();
      
      if (error) {
        console.error("Error fetching jobs:", error);
        setJobs([]);
        return;
      }

      setJobs(data || []);
    } catch (err) {
      console.error("Exception fetching jobs:", err);
      // Use mock data if API fails
      setJobs([
        {
          id: '1',
          title: 'Construction Worker',
          company: 'ABC Builders',
          location: 'Mumbai',
          job_type: 'full-time',
          category: 'Construction',
          salary: '₹15,000 - ₹20,000/month',
          description: 'We need experienced construction workers for a new residential project.',
          posted_at: new Date().toISOString(),
          status: 'active'
        },
        {
          id: '2',
          title: 'Farm Helper',
          company: 'Green Farms',
          location: 'Punjab',
          job_type: 'seasonal',
          category: 'Agriculture',
          salary: '₹12,000/month',
          description: 'Seasonal work available on our farm during harvest season.',
          posted_at: new Date().toISOString(),
          status: 'active'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories and locations for filters
  const categories = Array.from(new Set(jobs.map(job => job.category).filter(Boolean)));
  const locations = Array.from(new Set(jobs.map(job => job.location).filter(Boolean)));

  // Filter jobs based on search and filter criteria
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesCategory = !filterCategory || job.category === filterCategory;
    const matchesLocation = !filterLocation || job.location === filterLocation;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-background">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src="/migii-icon.svg" alt="Migii Logo" className="h-8 w-8" />
            <h1 className="text-xl font-bold">MIGII</h1>
          </div>
          <div>
            <Link to="/login">
              <Button variant="outline" className="mr-2">Login</Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Available Jobs
          </h1>
          <p className="text-lg text-gray-600">Find the perfect work opportunity</p>
        </div>
        
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by job title, company or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Locations</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading available jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card className="bg-card/30 text-center py-8">
            <CardContent>
              <p className="text-xl font-medium mb-2">No jobs found</p>
              <p className="text-muted-foreground mb-4">Try adjusting your search criteria</p>
              <Button variant="outline" onClick={() => {
                setSearchTerm("");
                setFilterCategory("");
                setFilterLocation("");
              }}>
                Clear filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover-glow hover-raise bg-gradient-to-br from-card to-background/80">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Building className="h-4 w-4 mr-1" />
                        {job.company}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className={
                      job.job_type === 'full-time' ? 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200' :
                      job.job_type === 'part-time' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200' :
                      job.job_type === 'contract' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200' :
                      'bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200'
                    }>
                      {job.job_type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-3 space-y-3">
                  {job.location && (
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{job.location}</span>
                    </div>
                  )}
                  
                  {job.salary && (
                    <div className="flex items-center text-sm">
                      <span className="font-medium mr-2">Salary:</span>
                      <span>{job.salary}</span>
                    </div>
                  )}
                  
                  {job.category && (
                    <div className="flex items-center text-sm">
                      <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{job.category}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Posted: {formatDate(job.posted_at)}</span>
                  </div>

                  <div className="border-t border-border/30 my-2 pt-2"></div>
                  
                  <div className="text-sm line-clamp-3">
                    {job.description}
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <div className="w-full flex justify-between items-center">
                    <Button variant="outline" size="sm" className="hover:bg-primary/10">
                      View Details
                    </Button>
                    <Link to="/login">
                      <Button size="sm" className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                        Login to Apply
                      </Button>
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        
        <div className="mt-12 mb-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Join MIGII Today</h2>
          <p className="mb-6 max-w-xl mx-auto">
            Register as a worker to access job applications, ID cards, and support services.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/login">
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 min-w-[150px]">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">MIGII</h3>
              <p className="text-sm text-gray-300">
                Worker management platform connecting businesses with skilled workers.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Contact Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-700 text-center text-sm text-gray-400">
            <p>© 2025 MIGII. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
