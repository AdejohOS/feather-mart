import Link from 'next/link'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from './ui/accordion'
import { Mail, MapPin } from 'lucide-react'
import { FaFacebook, FaInstagram, FaTwitter, FaWhatsapp } from 'react-icons/fa'
import { Button } from './ui/button'

export const LinksAccordion = () => {
  return (
    <Accordion type='single' collapsible className='w-full'>
      <AccordionItem value='item-1'>
        <AccordionTrigger>Category</AccordionTrigger>
        <AccordionContent>
          <p className='hover:text-teal-600'>
            <Link href='/'>Food</Link>
          </p>
        </AccordionContent>
        <AccordionContent>
          <p className='hover:text-teal-600'>
            <Link href='/'>Broilers</Link>
          </p>
        </AccordionContent>
        <AccordionContent>
          <p className='hover:text-teal-600'>
            <Link href='/'>Layers</Link>
          </p>
        </AccordionContent>
        <AccordionContent>
          <p className='hover:text-teal-600'>
            <Link href='/'>6 Months</Link>
          </p>
        </AccordionContent>
        <AccordionContent>
          <p className='hover:text-teal-600'>
            <Link href='/'>Largest</Link>
          </p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value='item-2'>
        <AccordionTrigger>Company</AccordionTrigger>
        <AccordionContent>
          <p className='hover:text-teal-600'>
            <Link href='/'>About us</Link>
          </p>
        </AccordionContent>
        <AccordionContent>
          <p className='hover:text-teal-600'>
            <Link href='/'>Delievery</Link>
          </p>
        </AccordionContent>
        <AccordionContent>
          <p className='hover:text-teal-600'>
            <Link href='/'>Legal Notice</Link>
          </p>
        </AccordionContent>
        <AccordionContent>
          <p className='hover:text-teal-600'>
            <Link href='/'>Terms & Conditions</Link>
          </p>
        </AccordionContent>
        <AccordionContent>
          <p className='hover:text-teal-600'>
            <Link href='/'>Contact us</Link>
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value='item-3'>
        <AccordionTrigger>Account</AccordionTrigger>
        <AccordionContent>
          <p className='hover:text-teal-600'>
            <Link href='/'>Sign In</Link>
          </p>
        </AccordionContent>
        <AccordionContent>
          <p className='hover:text-teal-600'>
            <Link href='/'>View Cart</Link>
          </p>
        </AccordionContent>
        <AccordionContent>
          <p className='hover:text-teal-600'>
            <Link href='/'>Return Policy</Link>
          </p>
        </AccordionContent>
        <AccordionContent>
          <p className='hover:text-teal-600'>
            <Link href='/vendor-marketplace'>Sell on FeatherMart</Link>
          </p>
        </AccordionContent>
        <AccordionContent>
          <p className='hover:text-teal-600'>
            <Link href='/'>Payments</Link>
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value='item-3'>
        <AccordionTrigger>Contact</AccordionTrigger>
        <AccordionContent>
          <div className='space-y-3'>
            <p className='flex gap-3'>
              <MapPin className='size-5 shrink-0 text-teal-600' />
              265 Jamison Auth, Kenturkey, BA, USA
            </p>
            <p className='flex gap-3'>
              <FaWhatsapp className='size-5 shrink-0 text-teal-600' />
              +234 706 3494 393
            </p>
            <p className='flex gap-3'>
              <Mail className='size-5 shrink-0 text-teal-600' />
              sales@feathermart.com
            </p>

            <p className='flex gap-3'>
              <Button size='icon' variant='territory'>
                <FaFacebook />
              </Button>
              <Button size='icon' variant='territory'>
                <FaInstagram />
              </Button>
              <Button size='icon' variant='territory'>
                <FaTwitter />
              </Button>
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
