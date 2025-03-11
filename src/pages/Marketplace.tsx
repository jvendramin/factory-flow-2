
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Download, Filter, Heart, Search, Settings, Share2, ShoppingCart, Star, Store, Tag } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const Marketplace = () => {
  const handleCopyTemplate = (templateName: string) => {
    toast({
      title: "Template Copied",
      description: `"${templateName}" has been added to your simulations.`,
    });
  };

  return (
    <div className="p-8">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Store className="h-8 w-8" />
              Template Marketplace
            </h1>
            <p className="text-muted-foreground mt-1">Browse and use community-created factory templates</p>
          </div>
          <Button>
            Share Your Template
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search templates..."
              className="pl-8"
            />
          </div>
          
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="featured">
        <TabsList className="mb-6">
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="saved">Saved Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="featured">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TemplateCard
              title="Electronics Assembly Line"
              author="Sarah Johnson"
              rating={4.8}
              reviews={124}
              category="Electronics"
              efficiency={92}
              price="Free"
              imageUrl="https://images.unsplash.com/photo-1518770660439-4636190af475"
              onCopy={() => handleCopyTemplate("Electronics Assembly Line")}
            />
            
            <TemplateCard
              title="Food Processing Pipeline"
              author="David Martinez"
              rating={4.6}
              reviews={89}
              category="Food & Beverage"
              efficiency={87}
              price="Free"
              imageUrl="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
              onCopy={() => handleCopyTemplate("Food Processing Pipeline")}
            />
            
            <TemplateCard
              title="Automotive Parts Production"
              author="Michael Chen"
              rating={4.9}
              reviews={156}
              category="Automotive"
              efficiency={94}
              price="Premium"
              imageUrl="https://images.unsplash.com/photo-1649972904349-6e44c42644a7"
              onCopy={() => handleCopyTemplate("Automotive Parts Production")}
            />
            
            <TemplateCard
              title="Pharmaceutical Packaging Line"
              author="Emma Wilson"
              rating={4.7}
              reviews={72}
              category="Pharmaceutical"
              efficiency={89}
              price="Free"
              imageUrl="https://images.unsplash.com/photo-1518770660439-4636190af475"
              onCopy={() => handleCopyTemplate("Pharmaceutical Packaging Line")}
            />
            
            <TemplateCard
              title="Sustainable Wood Processing"
              author="James Thompson"
              rating={4.5}
              reviews={68}
              category="Manufacturing"
              efficiency={85}
              price="Free"
              imageUrl="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
              onCopy={() => handleCopyTemplate("Sustainable Wood Processing")}
            />
            
            <TemplateCard
              title="Smart Textile Production"
              author="Lisa Garcia"
              rating={4.8}
              reviews={94}
              category="Textiles"
              efficiency={91}
              price="Premium"
              imageUrl="https://images.unsplash.com/photo-1649972904349-6e44c42644a7"
              onCopy={() => handleCopyTemplate("Smart Textile Production")}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="popular">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Similar template cards for the Popular tab */}
            <TemplateCard
              title="High-Efficiency Bottling Line"
              author="Thomas Wright"
              rating={5.0}
              reviews={203}
              category="Beverage"
              efficiency={96}
              price="Premium"
              imageUrl="https://images.unsplash.com/photo-1518770660439-4636190af475"
              onCopy={() => handleCopyTemplate("High-Efficiency Bottling Line")}
            />
            
            <TemplateCard
              title="Modular Computer Assembly"
              author="Rebecca Lee"
              rating={4.9}
              reviews={178}
              category="Electronics"
              efficiency={93}
              price="Free"
              imageUrl="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
              onCopy={() => handleCopyTemplate("Modular Computer Assembly")}
            />
            
            <TemplateCard
              title="Automated Bakery Production"
              author="Carlos Rodriguez"
              rating={4.8}
              reviews={156}
              category="Food"
              efficiency={91}
              price="Free"
              imageUrl="https://images.unsplash.com/photo-1649972904349-6e44c42644a7"
              onCopy={() => handleCopyTemplate("Automated Bakery Production")}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="categories">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CategoryCard
              name="Electronics"
              templateCount={183}
              icon={<Settings className="h-6 w-6" />}
            />
            <CategoryCard
              name="Food & Beverage"
              templateCount={147}
              icon={<ShoppingCart className="h-6 w-6" />}
            />
            <CategoryCard
              name="Automotive"
              templateCount={124}
              icon={<Settings className="h-6 w-6" />}
            />
            <CategoryCard
              name="Pharmaceuticals"
              templateCount={92}
              icon={<Tag className="h-6 w-6" />}
            />
            <CategoryCard
              name="Textiles"
              templateCount={78}
              icon={<Tag className="h-6 w-6" />}
            />
            <CategoryCard
              name="Manufacturing"
              templateCount={206}
              icon={<Settings className="h-6 w-6" />}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>Your Saved Templates</CardTitle>
              <CardDescription>
                Access templates you've saved for future use
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <SavedTemplate
                  title="Electronics Assembly Line"
                  author="Sarah Johnson"
                  savedDate="Mar 15, 2024"
                  category="Electronics"
                />
                
                <SavedTemplate
                  title="Automotive Parts Production"
                  author="Michael Chen"
                  savedDate="Feb 27, 2024"
                  category="Automotive"
                />
                
                <SavedTemplate
                  title="Food Processing Pipeline"
                  author="David Martinez"
                  savedDate="Jan 12, 2024"
                  category="Food & Beverage"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recent">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Similar template cards for the Recent tab */}
            <TemplateCard
              title="Green Energy Component Manufacturing"
              author="Julia Roberts"
              rating={4.7}
              reviews={42}
              category="Energy"
              efficiency={90}
              price="Free"
              imageUrl="https://images.unsplash.com/photo-1518770660439-4636190af475"
              onCopy={() => handleCopyTemplate("Green Energy Component Manufacturing")}
              isNew
            />
            
            <TemplateCard
              title="Semiconductor Testing Facility"
              author="Alan Chang"
              rating={4.8}
              reviews={37}
              category="Electronics"
              efficiency={92}
              price="Premium"
              imageUrl="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
              onCopy={() => handleCopyTemplate("Semiconductor Testing Facility")}
              isNew
            />
            
            <TemplateCard
              title="Eco-Friendly Paper Production"
              author="Maria Gonzalez"
              rating={4.6}
              reviews={28}
              category="Manufacturing"
              efficiency={88}
              price="Free"
              imageUrl="https://images.unsplash.com/photo-1649972904349-6e44c42644a7"
              onCopy={() => handleCopyTemplate("Eco-Friendly Paper Production")}
              isNew
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface TemplateCardProps {
  title: string;
  author: string;
  rating: number;
  reviews: number;
  category: string;
  efficiency: number;
  price: "Free" | "Premium";
  imageUrl: string;
  onCopy: () => void;
  isNew?: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  title,
  author,
  rating,
  reviews,
  category,
  efficiency,
  price,
  imageUrl,
  onCopy,
  isNew = false
}) => {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative">
        <img 
          src={imageUrl} 
          alt={title} 
          className="object-cover w-full h-full"
        />
        <div className="absolute top-2 right-2 flex items-center gap-2">
          {isNew && (
            <Badge className="bg-green-500 hover:bg-green-600">New</Badge>
          )}
          <Badge className={price === "Premium" ? "bg-amber-500 hover:bg-amber-600" : ""}>{price}</Badge>
        </div>
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>By {author}</CardDescription>
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Heart className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span>{rating.toFixed(1)}</span>
            <span className="text-muted-foreground text-sm">({reviews})</span>
          </div>
          <Badge variant="outline">{category}</Badge>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm">Efficiency:</span>
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary"
              style={{ width: `${efficiency}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium">{efficiency}%</span>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-2">
        <Button variant="outline" size="sm" className="gap-1">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        <Button size="sm" className="gap-1" onClick={onCopy}>
          <Copy className="h-4 w-4" />
          Use Template
        </Button>
      </CardFooter>
    </Card>
  );
};

interface CategoryCardProps {
  name: string;
  templateCount: number;
  icon: React.ReactNode;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ name, templateCount, icon }) => {
  return (
    <Card className="overflow-hidden hover:bg-accent/50 transition-colors cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h3 className="font-medium text-lg">{name}</h3>
            <p className="text-sm text-muted-foreground">{templateCount} templates</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface SavedTemplateProps {
  title: string;
  author: string;
  savedDate: string;
  category: string;
}

const SavedTemplate: React.FC<SavedTemplateProps> = ({
  title,
  author,
  savedDate,
  category
}) => {
  return (
    <div className="flex items-center justify-between border-b pb-4">
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">By {author} • Saved on {savedDate}</p>
        <Badge variant="outline" className="mt-1">{category}</Badge>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1">
          <Download className="h-4 w-4" />
          <span>Download</span>
        </Button>
        <Button size="sm" className="gap-1">
          <Copy className="h-4 w-4" />
          <span>Use</span>
        </Button>
      </div>
    </div>
  );
};

export default Marketplace;
