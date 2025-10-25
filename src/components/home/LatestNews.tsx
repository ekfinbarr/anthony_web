import { Play, Headphones, FileText, ChevronRight, MapPin, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const LatestNews = () => {
    const news = [
        {
            id: 1,
            title: "Annual Church Conference",
            date: "Nov 18, 2024",
            description: "Join us for our annual conference with special speakers and workshops.",
            category: "Conference",
            image: "https://picsum.photos/200/300",
        },
        {
            id: 2,
            title: "Youth Worship Night",
            date: "Nov 22, 2024",
            description: "An evening of praise, worship, and fellowship for our youth.",
            category: "Youth",
            image: "https://picsum.photos/200/300",
        },
        {
            id: 3,
            title: "Community Thanksgiving Dinner",
            date: "Nov 28, 2024",
            description: "Share a meal and give thanks with our church family.",
            category: "Community",
            image: "https://picsum.photos/200/300",
        },
    ];

    return (
        <section className="py-16 bg-church-pearl">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-heading font-bold text-church-charcoal mb-4 accent-line inline-block">
                        Recent News
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Stay updated with the latest news and events happening in and around our church community.
                    </p>
                </div>

                {/* Events Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {news.map((item) => (
                        <Card key={item.id} className="overflow-hidden card-hover group">
                            <div className="h-48 overflow-hidden">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                            </div>
                            <CardContent className="p-6">
                                <h3 className="text-2xl font-heading font-bold mb-2">{item.title}</h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                    <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" />
                                        {item.date}
                                    </span>
                                    <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" />
                                        {item.category}
                                    </span>
                                </div>
                                <p className="text-muted-foreground mb-4">
                                    {item.description}
                                </p>
                                <Link to={`/news/${item.id}`}>
                                    <Button variant="link" className="p-0 group">
                                        Read More <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* View All Button */}
                <div className="text-center">
                    <Link to="/news">
                        <Button variant="church" size="lg">
                            View All News
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default LatestNews;