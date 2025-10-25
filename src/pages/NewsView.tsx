import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Eye, Heart, Users, Clock, MapPin, ArrowRight, User, Calendar, Share } from "lucide-react";
import { Link } from "react-router-dom";
import bannerPhoto from '@/assets/images/church_banner.jpg';

const NewsView = () => {

    return (
        <div>
            {/* Single news content page with right sidebar (archives, latest news, others) */}

            {/* Hero Section */}
            {/* <section className="relative py-24 bg-gradient-dark text-church-pearl">
                <div className="absolute inset-0 pattern-geometric" />
                <div className="container mx-auto px-4 relative">
                    <h1 className="text-5xl font-heading font-bold mb-4 text-center">
                        News Title
                    </h1>
                    <div className="text-sm text-church-pearl/90 text-center">
                        <Link to="/news" className="hover:text-primary">News</Link>
                        <span className="mx-2">/</span>
                        <span>News Title</span>
                    </div>
                </div>
            </section> */}
            <section className="relative py-10 bg-gradient-dark text-church-pearl">
                <div className="absolute inset-0 pattern-geometric" />
                <div className="container mx-auto px-4 relative">
                    <div className="text-sm text-church-pearl/90 text-left">
                        <Link to="/news" className="hover:text-primary">News</Link>
                        <span className="mx-2">/</span>
                        <span>News Title</span>
                    </div>
                </div>
            </section>

            {/* Full News Content and Sidebar Section */}
            <section className="py-16 bg-background">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-4 gap-8">
                        {/* Main News Content */}
                        <div className="lg:col-span-3">
                            {/* Title */}
                            <h2 className="text-4xl font-heading font-bold mb-6">
                                Exciting Updates from Our Church Community
                            </h2>
                            {/* Post Meta section */}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                                <span className="flex items-center"><User className="h-4 w-4 mr-1" />
                                    Admin
                                </span>
                                <span className="flex items-center"><Clock className="h-4 w-4 mr-1" />
                                    5 min read
                                </span>
                                <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" />
                                    Dec 1, 2024
                                </span>
                            </div>
                            {/* horizontal line */}
                            <hr className="my-6 border-muted-foreground/20" />
                            {/* Reactions and shares */}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                                <Link to="#" className="flex items-center hover:text-primary">
                                    <span className="flex items-center"><Heart className="h-4 w-4 mr-1" />
                                        256 Likes
                                    </span>
                                </Link>
                                <Link to="#" className="flex items-center hover:text-primary">
                                    <span className="flex items-center"><Users className="h-4 w-4 mr-1" />
                                        34 Comments
                                    </span>
                                </Link>
                                <span className="flex items-center"><Share className="h-4 w-4 mr-1" />
                                    Share
                                </span>
                            </div>
                            {/* Post cover photo - if any */}
                            <img
                                src={bannerPhoto}
                                alt="News Cover Photo"
                                className="w-full h-64 object-cover mb-6 rounded-lg"
                            />
                            {/* News Article Content */}
                            <div className="prose max-w-none blog-post">
                                <p>Pope Leo today highlighted yet again the “immense suffering” of the more than two million Palestinians in Gaza, and called on those responsible for the peace negotiations now underway to reach a ceasefire, the release of hostages, and an end to the war “as soon as possible.” He also expressed concern at “the rise of anti-Semitic hatred in the world,” following the terrorist attack on a synagogue in Manchester, England, this past week.</p>

                                {/* Quote */}
                                <blockquote>
                                    "There are many missionary men and women ... who work in the service of migrants, and promote a new culture of fraternity on the theme of migration, beyond stereotypes and prejudices."
                                </blockquote>


                                <p>
                                    This is where the full news article content will be displayed. It can include text, images, videos, and other media to provide a comprehensive view of the news story.
                                </p>
                                <h2>Subheading 1</h2>
                                <p>
                                    Additional paragraphs of the news article can go here, providing more details and context about the story being covered.
                                </p>
                                <h2>Subheading 2</h2>
                                <p>
                                    More content can be added as needed to fully inform readers about the news topic.
                                </p>

                                {/* Quote */}
                                <blockquote>
                                    "This is a highlighted quote from the news article to emphasize an important point or statement."
                                </blockquote>
                                <h2>Subheading 3</h2>
                                <p>
                                    Concluding remarks or a summary of the news article can be placed here to wrap up the story.
                                </p>
                                <h2>Subheading 4</h2>
                                <p>
                                    Call to action or links to related articles can be included at the end of the news content.
                                    <Link to="/news" className="text-primary hover:underline">Explore more news articles</Link>.
                                </p>
                            </div>

                            {/* Reactions and shares */}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                                <Link to="#" className="flex items-center hover:text-primary">
                                    <span className="flex items-center"><Heart className="h-4 w-4 mr-1" />
                                        256 Likes
                                    </span>
                                </Link>
                                <Link to="#" className="flex items-center hover:text-primary">
                                    <span className="flex items-center"><Users className="h-4 w-4 mr-1" />
                                        34 Comments
                                    </span>
                                </Link>
                                <span className="flex items-center"><Share className="h-4 w-4 mr-1" />
                                    Share
                                </span>
                            </div>

                            {/* horizontal line */}
                            <hr className="my-12 border-muted-foreground/20" />

                            {/* Recommended from News */}
                            <div className="mt-12 bg-church-pearl p-6">
                                <h3 className="text-2xl font-heading font-bold mb-6">Recommended from News</h3>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    <Card className="hover:shadow-xl transition-shadow">
                                        <CardHeader>
                                            {/* Photo */}
                                            <img
                                                src={bannerPhoto}
                                                alt="News Image 1"
                                                className="w-full h-48 object-cover"
                                            />
                                            {/* Title */}
                                            <CardTitle>
                                                Exciting Updates from Our Church Community
                                            </CardTitle>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center"><User className="h-3 w-3 mr-1" />
                                                    Admin
                                                </span>
                                                <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" />
                                                    Dec 1, 2024
                                                </span>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-muted-foreground mb-4">
                                                Stay informed with the latest news and updates from our church community, including upcoming events, recent activities, and important announcements.
                                            </p>
                                            <Button variant="link" className="p-0 group">
                                                Read More <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                    <Card className="hover:shadow-xl transition-shadow">
                                        <CardHeader>
                                            {/* Photo */}
                                            <img
                                                src={bannerPhoto}
                                                alt="News Image 2"
                                                className="w-full h-48 object-cover"
                                            />
                                            {/* Title */}
                                            <CardTitle>
                                                Community Outreach Program Success
                                            </CardTitle>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center"><User className="h-3 w-3 mr-1" />
                                                    Admin
                                                </span>
                                                <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" />
                                                    Nov 20, 2024
                                                </span>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-muted-foreground mb-4">
                                                Our recent community outreach program was a great success, thanks to the dedication and support of our church members and volunteers.
                                            </p>
                                            <Button variant="link" className="p-0 group">
                                                Read More <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                    <Card className="hover:shadow-xl transition-shadow">
                                        <CardHeader>
                                            {/* Photo */}
                                            <img
                                                src={bannerPhoto}
                                                alt="News Image 3"
                                                className="w-full h-48 object-cover"
                                            />
                                            {/* Title */}
                                            <CardTitle>
                                                Youth Ministry Event Highlights
                                            </CardTitle>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center"><User className="h-3 w-3 mr-1" />
                                                    Admin
                                                </span>
                                                <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" />
                                                    Nov 15, 2024
                                                </span>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-muted-foreground mb-4">
                                                Highlights from our recent youth ministry event, showcasing the energy and enthusiasm of our young members.
                                            </p>
                                            <Button variant="link" className="p-0 group">
                                                Read More <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                    {/* Add more recommended news cards as needed */}
                                </div>
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-5">
                            {/* Vertical line */}
                            <div className="hidden lg:block border-l border-muted-foreground/20 lg:pr-0 px-0" />

                            {/* Sidebar */}
                            <aside className="space-y-8 lg:col-span-4 lg:pl-0">
                                {/* Latest News */}
                                <div>
                                    <h3 className="text-2xl font-heading font-bold mb-4">Latest News</h3>
                                    <div className="space-y-4">
                                        <Card className="hover:shadow-xl transition-shadow">
                                            <CardHeader>
                                                <CardTitle className="text-lg font-semibold">
                                                    Latest News Title 1
                                                </CardTitle>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center"><User className="h-3 w-3 mr-1" />
                                                        Admin
                                                    </span>
                                                    <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" />
                                                        Dec 1, 2024
                                                    </span>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-muted-foreground mb-4">
                                                    A brief summary of the latest news article to give readers an idea of the content.
                                                </p>
                                                <Button variant="link" className="p-0 group">
                                                    Read More <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </CardContent>
                                        </Card>
                                        <Card className="hover:shadow-xl transition-shadow">
                                            <CardHeader>
                                                <CardTitle className="text-lg font-semibold">
                                                    Latest News Title 2
                                                </CardTitle>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center"><User className="h-3 w-3 mr-1" />
                                                        Admin
                                                    </span>
                                                    <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" />
                                                        Nov 28, 2024
                                                    </span>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-muted-foreground mb-4">
                                                    A brief summary of another recent news article to keep readers informed.
                                                </p>
                                                <Button variant="link" className="p-0 group">
                                                    Read More <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </CardContent>
                                        </Card>
                                        {/* Add more latest news cards as needed */}
                                    </div>
                                </div>

                                {/* Archives */}
                                <div>
                                    <h3 className="text-2xl font-heading font-bold mb-4">Archives</h3>
                                    <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                        <li><a href="#" className="hover:text-primary">January 2024</a></li>
                                        <li><a href="#" className="hover:text-primary">December 2023</a></li>
                                        <li><a href="#" className="hover:text-primary">November 2023</a></li>
                                        <li><a href="#" className="hover:text-primary">October 2023</a></li>
                                        <li><a href="#" className="hover:text-primary">September 2023</a></li>
                                        {/* Add more archive links as needed */}
                                    </ul>
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-gradient-church">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-heading font-bold text-church-charcoal mb-4">
                        Want to See More?
                    </h2>
                    <p className="text-lg text-church-charcoal/80 mb-8 max-w-2xl mx-auto">
                        Visit our church to experience the warmth and fellowship of our community in person.
                    </p>
                    <Link to="/visit">
                        <Button variant="church" size="lg" className="group">
                            Plan Your Visit
                            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </section>
        </div >
        // <div>
        //     <h1>News View Page</h1>
        //     <p>This is where the full news article will be displayed.</p>
        //     <Link to="/news">
        //         <Button variant="church" size="lg" className="group">
        //             Back to News
        //             <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
        //         </Button>
        //     </Link>
        // </div>
        // );

    );
};

export default NewsView;