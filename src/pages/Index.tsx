import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { T } from '@/components/T';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Home, 
  Briefcase, 
  Search, 
  Shield, 
  MapPin, 
  Languages, 
  MessageSquare,
  Smartphone,
  Newspaper, // Replaced 'News' with 'Newspaper' which is available in lucide-react
  UserPlus,
  LogIn
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';

const Index = () => {
  const { t } = useLanguage();
  
  // Helper components
  const StatCard = ({ title, value }: { title: string; value: string }) => (
    <div className="bg-white p-4 rounded-lg shadow text-center">
      <p className="text-xl md:text-3xl font-bold text-primary mb-2">{value}</p>
      <p className="text-sm">{title}</p>
    </div>
  );

  const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );

  const ServiceCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
    <div className="bg-white p-4 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
      <div className="flex justify-center mb-3">{icon}</div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );

  const StoryCard = () => (
    <Card>
      <CardHeader>
        <CardTitle>Success Story</CardTitle>
        <CardDescription>Worker found job in 3 days</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum.</p>
      </CardContent>
      <CardFooter>
        <Button variant="link" className="ml-auto">Read Full Story</Button>
      </CardFooter>
    </Card>
  );

  const NewsCard = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Newspaper size={16} /> {/* Using Newspaper instead of News */}
          <CardTitle>News Title</CardTitle>
        </div>
        <CardDescription>April 5, 2025</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum.</p>
      </CardContent>
      <CardFooter>
        <Button variant="link" className="ml-auto">Read More</Button>
      </CardFooter>
    </Card>
  );

  const FAQItem = () => (
    <div className="border-b border-gray-200 pb-4">
      <h4 className="text-lg font-medium mb-2">Frequently asked question?</h4>
      <p className="text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum.</p>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Use shared Sidebar for consistent color */}
      <Sidebar />
      <div className="md:ml-64">
        {/* Hero Banner */}
        <section className="bg-primary text-white py-12 px-4 sm:py-16 sm:px-6 md:px-8 lg:px-16">
          <div className="container mx-auto max-w-7xl">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 text-center md:text-left">{t('heroBannerTitle')}</h1>
            <p className="text-base sm:text-lg md:text-xl mb-8 max-w-2xl mx-auto md:mx-0 text-center md:text-left">{t('heroBannerSubtitle')}</p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center md:justify-start">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">{t('joinNow')}</Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">{t('postJob')}</Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">{t('trackStatus')}</Button>
            </div>
          </div>
        </section>

        {/* Role Selector */}
        <section className="py-12 px-4 md:px-8 lg:px-16">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-center mb-8">{t('selectYourRole')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <Users size={48} className="text-primary" />
                  </div>
                  <CardTitle>{t('worker')}</CardTitle>
                  <CardDescription>{t('workerDescription')}</CardDescription>
                </CardHeader>
                <CardFooter className="justify-center pt-0">
                  <Button variant="outline" asChild>
                    <Link to="/worker-login">{t('joinNow')}</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <Briefcase size={48} className="text-primary" />
                  </div>
                  <CardTitle>{t('employer')}</CardTitle>
                  <CardDescription>{t('employerDescription')}</CardDescription>
                </CardHeader>
                <CardFooter className="justify-center pt-0">
                  <Button variant="outline" asChild>
                    <Link to="/login?tab=business">{t('joinNow')}</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <Shield size={48} className="text-primary" />
                  </div>
                  <CardTitle>{t('admin')}</CardTitle>
                  <CardDescription>{t('adminDescription')}</CardDescription>
                </CardHeader>
                <CardFooter className="justify-center pt-0">
                  <Button variant="outline" asChild>
                    <Link to="/login?tab=admin">{t('joinNow')}</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* Live Statistics */}
        <section className="py-12 px-4 md:px-8 lg:px-16 bg-gray-100">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12">{t('liveStatistics')}</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              <StatCard title={t('registeredWorkers')} value="1.2M+" />
              <StatCard title={t('jobsPosted')} value="45K+" />
              <StatCard title={t('jobsFilled')} value="38K+" />
              <StatCard title={t('regionsCovered')} value="28" />
              <StatCard title={t('languagesSupported')} value="12" />
              <StatCard title={t('grievancesResolved')} value="9.5K+" />
            </div>
          </div>
        </section>

        {/* Smart Search */}
        <section className="py-12 px-4 md:px-8 lg:px-16">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-center mb-8">{t('searchTitle')}</h2>
            
            <div className="max-w-3xl mx-auto">
              <Tabs defaultValue="all">
                <div className="flex justify-center mb-6">
                  <TabsList>
                    <TabsTrigger value="all">
                      <div className="flex items-center gap-2">
                        <Search size={16} />
                        <span>{t('search')}</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="jobs">
                      <div className="flex items-center gap-2">
                        <Briefcase size={16} />
                        <span>{t('jobs')}</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="status">
                      <div className="flex items-center gap-2">
                        <Home size={16} />
                        <span>{t('status')}</span>
                      </div>
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="all">
                  <div className="flex flex-col gap-4">
                    <Input placeholder={t('searchPlaceholder')} />
                    <div className="flex flex-wrap gap-2">
                      {/* <Button variant="outline" size="sm">{t('filterLanguage')}</Button> */}
                      <Button variant="outline" size="sm">{t('filterSkills')}</Button>
                      <Button variant="outline" size="sm">{t('filterLocation')}</Button>
                      <Button variant="outline" size="sm">{t('filterExperience')}</Button>
                    </div>
                    <Button>{t('search')}</Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="jobs">
                  <div className="flex flex-col gap-4">
                    <Input placeholder={t('searchPlaceholder')} />
                    <Button>{t('search')}</Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="status">
                  <div className="flex flex-col gap-4">
                    <Input placeholder={t('searchPlaceholder')} />
                    <Button>{t('search')}</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-12 px-4 md:px-8 lg:px-16 bg-gray-100">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12">{t('keyFeatures')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Shield size={32} className="text-primary" />}
                title={t('featureDigitalID')}
                description={t('featureDigitalIDDesc')}
              />
              
              <FeatureCard 
                icon={<MapPin size={32} className="text-primary" />}
                title={t('featureTracking')}
                description={t('featureTrackingDesc')}
              />
              
              <FeatureCard 
                icon={<Languages size={32} className="text-primary" />}
                title={t('featureMultilingual')}
                description={t('featureMultilingualDesc')}
              />
              
              <FeatureCard 
                icon={<Smartphone size={32} className="text-primary" />}
                title={t('featureMobile')}
                description={t('featureMobileDesc')}
              />
              
              <FeatureCard 
                icon={<MessageSquare size={32} className="text-primary" />}
                title={t('featureGrievance')}
                description={t('featureGrievanceDesc')}
              />
            </div>
          </div>
        </section>

        {/* Migrant Services */}
        <section className="py-12 px-4 md:px-8 lg:px-16">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12">{t('migrantServices')}</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              <ServiceCard 
                icon={<Briefcase size={24} className="text-primary" />}
                title={t('serviceFindJobs')}
                description={t('serviceFindJobsDesc')}
              />
              
              <ServiceCard 
                icon={<Users size={24} className="text-primary" />}
                title={t('serviceRegister')}
                description={t('serviceRegisterDesc')}
              />
              
              <ServiceCard 
                icon={<Shield size={24} className="text-primary" />}
                title={t('serviceVerify')}
                description={t('serviceVerifyDesc')}
              />
              
              <ServiceCard 
                icon={<MapPin size={24} className="text-primary" />}
                title={t('serviceLocate')}
                description={t('serviceLocateDesc')}
              />
              
              <ServiceCard 
                icon={<Home size={24} className="text-primary" />}
                title={t('serviceRights')}
                description={t('serviceRightsDesc')}
              />
              
              <ServiceCard 
                icon={<MessageSquare size={24} className="text-primary" />}
                title={t('serviceSupport')}
                description={t('serviceSupportDesc')}
              />
            </div>
          </div>
        </section>

        {/* Success Stories and News */}
        <section className="py-12 px-4 md:px-8 lg:px-16 bg-gray-100">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold mb-8">{t('successStories')}</h2>
                
                <div className="space-y-6">
                  <StoryCard />
                  <StoryCard />
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold mb-8">{t('newsUpdates')}</h2>
                
                <div className="space-y-6">
                  <NewsCard />
                  <NewsCard />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* App Promotion */}
        <section className="py-12 px-4 md:px-8 lg:px-16 bg-primary text-white">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl">
                <h2 className="text-2xl md:text-3xl font-semibold mb-4">{t('appPromoTitle')}</h2>
                <p className="text-lg mb-6">{t('appPromoDesc')}</p>
                
                <div className="flex flex-wrap gap-4">
                  <Button variant="secondary" size="lg">{t('androidApp')}</Button>
                  <Button variant="outline" size="lg">{t('iOSApp')}</Button>
                  <Button variant="outline" size="lg">{t('scanQRCode')}</Button>
                </div>
              </div>
              
              <div className="w-full md:w-auto">
                <img 
                  src="https://via.placeholder.com/300x600" 
                  alt="Migii Mobile App" 
                  className="w-full max-w-[300px] mx-auto rounded-xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Help & Support */}
        <section className="py-12 px-4 md:px-8 lg:px-16">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12">{t('helpSupport')}</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xl font-semibold mb-6">{t('frequentlyAsked')}</h3>
                
                <div className="space-y-4">
                  <FAQItem />
                  <FAQItem />
                  <FAQItem />
                </div>
                
                <div className="mt-6">
                  <Button variant="outline">{t('viewAllFAQs')}</Button>
                </div>
              </div>
              
              <div>
                <div className="bg-gray-100 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-6">{t('contactUs')}</h3>
                  
                  <div className="flex items-center mb-6 text-primary">
                    <MessageSquare className="mr-2" />
                    <span className="text-lg font-medium">{t('emergencyHelpline')}: 1800-XXX-XXXX</span>
                  </div>
                  
                  <div className="space-y-4">
                    <Input placeholder={t('yourName')} />
                    <Input placeholder={t('yourEmail')} />
                    <Input placeholder={t('yourQuery')} />
                    
                    <Button>{t('submit')}</Button>
                    
                    <p className="text-sm text-gray-500 mt-2">{t('responseTime')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-16 px-4 md:px-8 lg:px-16">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('aboutUs')}</h3>
                <ul className="space-y-2">
                  <li><Link to="#" className="text-gray-300 hover:text-white">{t('ourMission')}</Link></li>
                  <li><Link to="#" className="text-gray-300 hover:text-white">{t('howItWorks')}</Link></li>
                  <li><Link to="#" className="text-gray-300 hover:text-white">{t('team')}</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('partners')}</h3>
                <ul className="space-y-2">
                  <li><Link to="#" className="text-gray-300 hover:text-white">{t('governmentAgencies')}</Link></li>
                  <li><Link to="#" className="text-gray-300 hover:text-white">{t('NGOs')}</Link></li>
                  <li><Link to="#" className="text-gray-300 hover:text-white">{t('corporates')}</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('resources')}</h3>
                <ul className="space-y-2">
                  <li><Link to="#" className="text-gray-300 hover:text-white">{t('blog')}</Link></li>
                  <li><Link to="#" className="text-gray-300 hover:text-white">{t('pressReleases')}</Link></li>
                  <li><Link to="#" className="text-gray-300 hover:text-white">{t('reports')}</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('legal')}</h3>
                <ul className="space-y-2">
                  <li><Link to="#" className="text-gray-300 hover:text-white">{t('privacyPolicy')}</Link></li>
                  <li><Link to="#" className="text-gray-300 hover:text-white">{t('termsOfUse')}</Link></li>
                  <li><Link to="#" className="text-gray-300 hover:text-white">{t('disclaimer')}</Link></li>
                </ul>
              </div>
            </div>
            
            <Separator className="my-8 bg-gray-600" />
            
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p>© 2025 Migii. {t('allRightsReserved')}</p>
              </div>
              
              <div className="flex gap-4">
                {/* Social Media Icons */}
                <Link to="#" className="text-gray-300 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </Link>
                <Link to="#" className="text-gray-300 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                </Link>
                <Link to="#" className="text-gray-300 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </Link>
                <Link to="#" className="text-gray-300 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
