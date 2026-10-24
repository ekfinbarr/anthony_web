import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowRight } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

const Blog = () => {
  const posts = [
    { id: 1, title: "Finding Hope in Difficult Times", author: "Very Rev. Fr. Sylvester Tolulope Oladunjoye", date: "Nov 15, 2024", excerpt: "Discover how faith can guide us through life's challenges..." },
    { id: 2, title: "The Power of Community", author: "Sarah Johnson", date: "Nov 10, 2024", excerpt: "Why gathering together matters more than ever..." },
    { id: 3, title: "Living with Purpose", author: "Michael Davis", date: "Nov 5, 2024", excerpt: "Understanding God's plan for your life..." },
  ];

  return (
    <div>
      <PageHeader title="Blog" description="Stories, insights, and inspiration" />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle>{post.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center"><User className="h-3 w-3 mr-1" />{post.author}</span>
                    <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" />{post.date}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                  <Button variant="link" className="p-0 group">
                    Read More <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;