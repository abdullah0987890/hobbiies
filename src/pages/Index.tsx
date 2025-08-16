import Landing from '@/components/landingPage/carousel'
import FeatureCircle from '@/components/landingPage/FeatureCircle'
import Footer from '@/components/landingPage/Footer'
import Hero from '@/components/landingPage/Hero'
import PricingSection from '@/components/landingPage/PricingSection'
import ProcessSection from '@/components/landingPage/ProcessSection'
import StatsSection from '@/components/landingPage/StatsSection'



type Props = {}

const Index = (props: Props) => {
return (
<div className="min-h-screen overflow-x-hidden">
        <Hero />
        <StatsSection />
        <Landing />
        <ProcessSection />
        <FeatureCircle />
        <PricingSection />
        <Footer />
    </div>
)
}

export default Index