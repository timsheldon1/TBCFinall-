import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Search, HelpCircle, Phone, Mail, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FAQModalProps {
  trigger?: React.ReactNode;
}

export default function FAQModal({ trigger }: FAQModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);

  const faqs = [
    {
      category: 'Booking & Planning',
      questions: [
        {
          question: 'How far in advance should I book?',
          answer: 'We recommend booking 3-6 months in advance, especially for peak season (July-October) and luxury accommodations. However, we can often accommodate last-minute bookings depending on availability.'
        },
        {
          question: 'What\'s included in the safari packages?',
          answer: 'Most packages include accommodation, meals, game drives, professional guides, park fees, and airport transfers. International flights are typically not included unless specified. We\'ll provide a detailed itinerary with inclusions upon booking.'
        },
        {
          question: 'Do you offer custom safari itineraries?',
          answer: 'Absolutely! We specialize in creating personalized safari experiences tailored to your interests, budget, and travel dates. Our experts will work with you to design the perfect adventure.'
        },
        {
          question: 'Can I combine multiple destinations?',
          answer: 'Yes! Many of our guests combine destinations like Kenya and Tanzania for the ultimate safari experience. We can arrange seamless transfers between countries and create multi-country itineraries.'
        }
      ]
    },
    {
      category: 'Travel Requirements',
      questions: [
        {
          question: 'Do I need a visa for East Africa?',
          answer: 'Visa requirements vary by nationality. Most visitors need a visa for Kenya and/or Tanzania. We recommend checking with your local embassy or using services like VisaHQ. We can provide invitation letters to support your visa application.'
        },
        {
          question: 'What vaccinations do I need?',
          answer: 'Yellow fever vaccination is required if you\'re traveling from a country with risk of yellow fever transmission. Other recommended vaccinations include hepatitis A, typhoid, and routine vaccines. Consult your doctor or a travel clinic for personalized advice.'
        },
        {
          question: 'What should I pack for a safari?',
          answer: 'Pack neutral-colored clothing (khaki, beige, green), comfortable walking shoes, sun protection (hat, sunscreen, sunglasses), insect repellent, binoculars, camera, medications, and lightweight layers for varying temperatures.'
        }
      ]
    },
    {
      category: 'During Your Safari',
      questions: [
        {
          question: 'What is a typical day on safari like?',
          answer: 'Days typically start early (around 6 AM) with coffee/tea and a light breakfast before morning game drives. After lunch and rest, afternoon drives continue until sunset. Evenings include dinner and relaxation around the campfire.'
        },
        {
          question: 'Will I see the Big Five?',
          answer: 'While we can\'t guarantee wildlife sightings (as animals are wild), our experienced guides know the best areas and times to maximize your chances. Most guests see lions, elephants, buffalo, leopard, and rhino during their safari.'
        },
        {
          question: 'What if I have dietary restrictions?',
          answer: 'We accommodate various dietary requirements including vegetarian, vegan, gluten-free, and allergies. Please inform us at the time of booking so we can make appropriate arrangements with our lodges and camps.'
        }
      ]
    },
    {
      category: 'Payments & Cancellations',
      questions: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept bank transfers, major credit cards (Visa, MasterCard, American Express), and PayPal. Payment schedules vary by package, but typically require a 20-30% deposit to confirm booking.'
        },
        {
          question: 'What is your cancellation policy?',
          answer: 'Cancellation policies vary by season and accommodation type. Generally, cancellations made 60+ days before travel receive a full refund minus a small administrative fee. Please check your specific booking terms for details.'
        },
        {
          question: 'Is travel insurance required?',
          answer: 'While not mandatory, we strongly recommend comprehensive travel insurance covering trip cancellation, medical emergencies, and evacuation. We can recommend trusted insurance providers.'
        }
      ]
    },
    {
      category: 'Accommodations',
      questions: [
        {
          question: 'What types of accommodation do you offer?',
          answer: 'We partner with luxury lodges, tented camps, and boutique hotels. Options range from intimate bush camps to 5-star luxury resorts, all carefully selected for their location, service, and safari experience.'
        },
        {
          question: 'Are the accommodations safe?',
          answer: 'All our partner accommodations prioritize guest safety with 24/7 security, emergency procedures, and trained staff. Many properties are fenced and have night guards. Your guide will also provide safety briefings.'
        },
        {
          question: 'Do accommodations have WiFi and electricity?',
          answer: 'Most luxury lodges and camps offer WiFi (though connectivity can be limited in remote areas) and 24-hour electricity. Some bush camps may use solar power and have limited connectivity, perfect for a digital detox!'
        }
      ]
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(faq =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="group flex items-center gap-2 text-sm text-[#292524]/60 hover:text-[#c9a961] transition-colors">
            <HelpCircle className="w-4 h-4" />
            View FAQ
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#f5f0ea] border-[#e8e0d4] p-0 rounded-sm [&>button[class]]:hidden">
        {/* ── Header ── */}
        <div className="sticky top-0 z-10 bg-[#f5f0ea] border-b border-[#e8e0d4] px-8 pt-8 pb-6">
          {/* Close button */}
          <DialogClose className="absolute right-6 top-6 w-8 h-8 rounded-full bg-[#292524]/5 flex items-center justify-center text-[#292524]/50 hover:bg-[#292524]/10 hover:text-[#292524] transition-all z-20">
            <X className="w-4 h-4" />
            <span className="sr-only">Close</span>
          </DialogClose>

          <DialogHeader className="space-y-0">
            <div className="w-10 h-[2px] bg-[#c9a961] mb-4" />
            <DialogTitle className="text-2xl md:text-3xl font-light text-[#292524] tracking-tight">
              Frequently Asked Questions
            </DialogTitle>
            <p className="text-sm text-[#292524]/40 font-light mt-1">
              Everything you need to know about planning your safari
            </p>
          </DialogHeader>

          {/* ── Search ── */}
          <div className="relative mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#292524]/30 w-4 h-4 pointer-events-none" />
            <Input
              placeholder="Search questions…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 pl-11 pr-4 bg-white border border-[#e8e0d4] rounded-sm text-sm text-[#292524] placeholder:text-[#292524]/30 focus-visible:ring-1 focus-visible:ring-[#c9a961]/40 focus-visible:ring-offset-0 focus-visible:border-[#c9a961] transition-colors"
            />
          </div>
        </div>

        {/* ── FAQ Categories ── */}
        <div className="px-8 py-6 space-y-8">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                {/* category label */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c9a961]" />
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#c9a961] font-medium">
                    {category.category}
                  </p>
                </div>

                {/* accordion */}
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, faqIndex) => (
                    <AccordionItem
                      key={faqIndex}
                      value={`${categoryIndex}-${faqIndex}`}
                      className="border-b border-[#e8e0d4] last:border-b-0"
                    >
                      <AccordionTrigger className="text-left text-[#292524] text-sm font-medium hover:text-[#c9a961] transition-colors py-4 [&[data-state=open]]:text-[#c9a961]">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-[#292524]/50 text-sm leading-relaxed pb-4 font-light">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <Search className="w-8 h-8 text-[#292524]/15 mx-auto mb-4" />
              <h3 className="text-lg font-light text-[#292524] mb-1">No results found</h3>
              <p className="text-sm text-[#292524]/40 font-light">
                Try adjusting your search or browse all categories
              </p>
            </div>
          )}
        </div>

        {/* ── Still Need Help ── */}
        <div className="mx-8 mb-8 bg-[#292524] rounded-sm p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a961] mb-1">Still have questions?</p>
              <p className="text-white/40 text-sm font-light">
                Our team is ready to help plan your adventure.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/contact"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-2 bg-[#c9a961] text-[#1c1917] px-5 py-2.5 rounded-sm text-xs uppercase tracking-wide font-medium hover:bg-[#d4b56e] transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                Contact Us
              </Link>
              <a
                href="tel:+254116072343"
                className="inline-flex items-center gap-2 border border-white/15 text-white/60 px-5 py-2.5 rounded-sm text-xs uppercase tracking-wide hover:border-[#c9a961] hover:text-[#c9a961] transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                Call Now
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
