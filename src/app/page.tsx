import { CardBody, CardContainer, CardItem } from '@/components/global/3d-card'
import { HeroParallax } from '@/components/global/connect-parallax'
import { ContainerScroll } from '@/components/global/container-scroll-animation'
import { InfiniteMovingCards } from '@/components/global/infinite-moving-cards'
import { LampComponent } from '@/components/global/lamp'
import Navbar from '@/components/global/navbar'
import { Button } from '@/components/ui/button'
import { clients, products } from '@/lib/constant'
import { CheckIcon, Zap, Workflow, Bot, Database, FileText, Code2 } from 'lucide-react'
import Image from 'next/image'
import Footer from '@/components/global/footer'
import ReviewsSection from '@/components/landing/reviews-section'

export default function Home() {
  const features = [
    {
      icon: <Zap className="w-6 h-6 text-white" />,
      title: "Lightning Fast",
      description: "Process your workflows in seconds with our optimized automation engine."
    },
    {
      icon: <Workflow className="w-6 h-6 text-white" />,
      title: "Smart Workflows",
      description: "Create complex workflows with our intuitive drag-and-drop interface."
    },
    {
      icon: <Bot className="w-6 h-6 text-white" />,
      title: "AI Powered",
      description: "Leverage AI to automate repetitive tasks and make smart decisions."
    },
    {
      icon: <Database className="w-6 h-6 text-white" />,
      title: "Secure Storage",
      description: "Your data is encrypted and stored securely in our cloud infrastructure."
    },
    {
      icon: <FileText className="w-6 h-6 text-white" />,
      title: "Documentation",
      description: "Comprehensive guides and tutorials to help you get started quickly."
    },
    {
      icon: <Code2 className="w-6 h-6 text-white" />,
      title: "Developer API",
      description: "Build custom integrations with our powerful API and SDKs."
    }
  ];

  return (
    <main className="flex items-center justify-center flex-col">
      <Navbar />
      <section className="min-h-screen w-full bg-neutral-950 rounded-md !overflow-visible relative flex flex-col items-center antialiased">
        <div className="absolute inset-0 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_35%,#223_100%)]"></div>
        <div className="flex flex-col mt-[-100px] md:mt-[-50px]">
          <ContainerScroll
            titleComponent={
              <div className="flex items-center flex-col">
                <Button
                  size={'lg'}
                  className="p-8 mb-8 md:mb-0 text-2xl w-full sm:w-fit border-t-2 rounded-full border-[#4D4D4D] bg-[#1F1F1F] hover:bg-white group transition-all flex items-center justify-center gap-4 hover:shadow-xl hover:shadow-neutral-500 duration-500"
                >
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-neutral-500 to-neutral-600 md:text-center font-sans group-hover:bg-gradient-to-r group-hover:from-black goup-hover:to-black">
                    Start For Free Today
                  </span>
                </Button>
                <h1 className="text-5xl md:text-8xl bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-600 font-sans font-bold">
                  Automate Your Work With Flowzen
                </h1>
              </div>
            }
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 bg-neutral-950 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Powerful Features</h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
              Everything you need to automate your workflow and boost productivity.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 border rounded-lg bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 rounded-lg bg-neutral-800">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                </div>
                <p className="text-neutral-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <ReviewsSection />

      {/* CTA Section */}
      <section className="w-full py-20 bg-neutral-950 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto mb-8">
            Join thousands of teams who are already automating their workflows with Flowzen.
          </p>
          <Button size="lg" className="px-8 py-6 text-lg">
            Start Your Free Trial
          </Button>
        </div>
      </section>

      <Footer />
    </main>
  )
}
