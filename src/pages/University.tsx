
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Clock, FileText, GraduationCap, PlayCircle, Search, ThumbsUp, Video } from "lucide-react";

const University = () => {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <GraduationCap className="h-8 w-8" />
            Factory Flow University
          </h1>
          <p className="text-muted-foreground mt-1">Learn about factory operations, optimization techniques, and business strategies</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search resources..."
            className="pl-8"
          />
        </div>
      </div>
      
      <Tabs defaultValue="courses">
        <TabsList className="mb-6">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
          <TabsTrigger value="saved">Saved Resources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="courses">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CourseCard 
              title="Factory Operations Fundamentals" 
              lessons={12} 
              duration="8 hours" 
              level="Beginner"
              image="https://images.unsplash.com/photo-1518770660439-4636190af475"
            />
            
            <CourseCard 
              title="Advanced Simulation Techniques" 
              lessons={8} 
              duration="6 hours" 
              level="Intermediate"
              image="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
            />
            
            <CourseCard 
              title="Manufacturing Efficiency Optimization" 
              lessons={10} 
              duration="7 hours" 
              level="Advanced"
              image="https://images.unsplash.com/photo-1649972904349-6e44c42644a7"
            />
            
            <CourseCard 
              title="Supply Chain Integration" 
              lessons={9} 
              duration="5 hours" 
              level="Intermediate"
              image="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
            />
            
            <CourseCard 
              title="Sustainable Manufacturing Practices" 
              lessons={7} 
              duration="4 hours" 
              level="All Levels"
              image="https://images.unsplash.com/photo-1649972904349-6e44c42644a7"
            />
            
            <CourseCard 
              title="Factory Financial Management" 
              lessons={11} 
              duration="9 hours" 
              level="Advanced"
              image="https://images.unsplash.com/photo-1518770660439-4636190af475"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="articles">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <ScrollArea className="h-[800px] pr-4">
                <div className="space-y-6">
                  <ArticleCard
                    title="10 Ways to Improve Factory Efficiency Without Major Investment"
                    excerpt="Discover practical, low-cost approaches to boost your factory's productivity and reduce waste."
                    date="March 15, 2024"
                    readTime="8 min read"
                    category="Efficiency"
                  />
                  
                  <ArticleCard
                    title="Understanding Industry 4.0 and Its Impact on Manufacturing"
                    excerpt="A comprehensive overview of how smart technology and data are transforming the factory floor."
                    date="February 28, 2024"
                    readTime="12 min read"
                    category="Technology"
                  />
                  
                  <ArticleCard
                    title="Lean Manufacturing Principles for Modern Factories"
                    excerpt="How to apply time-tested lean principles in today's technology-driven manufacturing environment."
                    date="February 12, 2024"
                    readTime="10 min read"
                    category="Methodology"
                  />
                  
                  <ArticleCard
                    title="The Future of Factory Automation: Trends to Watch"
                    excerpt="Explore emerging technologies and approaches that will define the next generation of factory automation."
                    date="January 25, 2024"
                    readTime="15 min read"
                    category="Trends"
                  />
                  
                  <ArticleCard
                    title="Balancing Automation and Human Labor in Modern Manufacturing"
                    excerpt="Finding the right mix of automated systems and skilled workers for optimal factory performance."
                    date="January 10, 2024"
                    readTime="9 min read"
                    category="Workforce"
                  />
                  
                  <ArticleCard
                    title="Energy Efficiency in Manufacturing: Cost Savings and Sustainability"
                    excerpt="Practical approaches to reduce energy consumption while improving your factory's environmental footprint."
                    date="December 18, 2023"
                    readTime="11 min read"
                    category="Sustainability"
                  />
                </div>
              </ScrollArea>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Popular Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      Efficiency
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      Technology
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      Automation
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      Sustainability
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      Workforce
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      Financial Management
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Featured Article</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="aspect-video rounded-md bg-muted overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1518770660439-4636190af475"
                        alt="Featured article cover"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <h3 className="font-medium">The Complete Guide to Factory Simulation</h3>
                    <p className="text-sm text-muted-foreground">Learn how accurate factory simulations can transform your operations and increase profitability.</p>
                    <Button variant="link" className="p-0 h-auto text-sm">Read Article →</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="tutorials">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TutorialCard
              title="Setting Up Your First Factory Simulation"
              duration="15 min"
              type="video"
            />
            
            <TutorialCard
              title="Optimizing Conveyor Belt Layouts"
              duration="12 min"
              type="video"
            />
            
            <TutorialCard
              title="Balancing Production Lines"
              duration="20 min"
              type="video"
            />
            
            <TutorialCard
              title="Creating Custom Equipment Templates"
              duration="10 min"
              type="article"
            />
            
            <TutorialCard
              title="Advanced Bottleneck Analysis"
              duration="25 min"
              type="video"
            />
            
            <TutorialCard
              title="Importing CAD Designs Into Simulations"
              duration="18 min"
              type="article"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>Your Saved Resources</CardTitle>
              <CardDescription>
                Access your bookmarked courses, articles, and tutorials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Courses</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span>Factory Operations Fundamentals</span>
                      </div>
                      <Button variant="outline" size="sm">Resume</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span>Advanced Simulation Techniques</span>
                      </div>
                      <Button variant="outline" size="sm">Resume</Button>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Articles</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>Understanding Industry 4.0 and Its Impact on Manufacturing</span>
                      </div>
                      <Button variant="ghost" size="sm">Read</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>Lean Manufacturing Principles for Modern Factories</span>
                      </div>
                      <Button variant="ghost" size="sm">Read</Button>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Tutorials</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Video className="h-4 w-4 text-muted-foreground" />
                        <span>Setting Up Your First Factory Simulation</span>
                      </div>
                      <Button variant="ghost" size="sm">Watch</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface CourseCardProps {
  title: string;
  lessons: number;
  duration: string;
  level: string;
  image: string;
}

const CourseCard: React.FC<CourseCardProps> = ({
  title,
  lessons,
  duration,
  level,
  image
}) => {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative">
        <img 
          src={image} 
          alt={title} 
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <PlayCircle className="h-12 w-12 text-white/90" />
        </div>
      </div>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span>{lessons} Lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{duration}</span>
          </div>
        </div>
        <div className="mt-3">
          <span className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded">
            {level}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Enroll Now</Button>
      </CardFooter>
    </Card>
  );
};

interface ArticleCardProps {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  title,
  excerpt,
  date,
  readTime,
  category
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded">
            {category}
          </span>
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">{excerpt}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{readTime}</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="gap-1">
              <ThumbsUp className="h-4 w-4" />
              <span>124</span>
            </Button>
            <Button variant="outline" size="sm">Read More</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface TutorialCardProps {
  title: string;
  duration: string;
  type: "video" | "article";
}

const TutorialCard: React.FC<TutorialCardProps> = ({
  title,
  duration,
  type
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-3">
          {type === "video" ? (
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <PlayCircle className="h-5 w-5 text-primary" />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium">{type === "video" ? "Video Tutorial" : "Text Tutorial"}</p>
            <p className="text-xs text-muted-foreground">{duration}</p>
          </div>
        </div>
        <h3 className="font-medium mb-4">{title}</h3>
        <Button className="w-full">
          {type === "video" ? "Watch Tutorial" : "Read Tutorial"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default University;
