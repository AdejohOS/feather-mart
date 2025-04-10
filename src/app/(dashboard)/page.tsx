import { Category } from './_components/category'
import { FeaturedFarmers } from './_components/featured-farmers'
import { FeaturedProducts } from './_components/featured-products'
import { HeroSlider } from './_components/hero-slider'
import { JoinMarketplace } from './_components/join-marketplace'
import { SellProducts } from './_components/sell-products'
export default function Home() {
  return (
    <div className=''>
      <HeroSlider />
      <Category />
      <FeaturedProducts />
      <SellProducts />
      <FeaturedFarmers />
      <JoinMarketplace />
    </div>
  )
}
