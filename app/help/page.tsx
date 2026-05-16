import { HelpCircle, BookOpen, MessageCircle, FileText, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const faqs = [
  {
    question: 'How does escrow work on ArcEscrow?',
    answer: 'Funds are locked in a smart contract until both parties agree on proof of delivery. Once the proof is verified, funds are automatically released to the recipient.',
  },
  {
    question: 'What happens if there is a dispute?',
    answer: 'Disputes are handled through our decentralized arbitration system. Both parties can submit evidence, and arbitrators vote on the resolution.',
  },
  {
    question: 'How are gas fees handled?',
    answer: 'Gas fees for contract creation are paid by the depositor. Transactions are processed on the Arc Testnet using USDC.',
  },
  {
    question: 'Can I cancel a contract?',
    answer: 'Creators can cancel an escrow contract within the first 30 minutes of creation, provided the task has not yet been accepted by a worker. Once accepted, the funds are committed until proof is submitted or the deadline expires.',
  },
]

const resources = [
  { icon: BookOpen, title: 'Documentation', description: 'Detailed guides and API reference', href: 'https://docs.arc.io/' },
  { icon: MessageCircle, title: 'Community', description: 'Join our Discord server', href: 'https://discord.com/invite/buildonarc' },
  { icon: FileText, title: 'Tutorials', description: 'Step-by-step video guides', href: '#' },
]

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Help Center</h1>
        <p className="text-sm text-muted-foreground">Find answers and get support</p>
      </div>

      <div className="glass-card rounded-xl border border-border/50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <HelpCircle className="size-5" />
          </div>
          <div>
            <h2 className="font-semibold">How can we help?</h2>
            <p className="text-sm text-muted-foreground">Search our knowledge base</p>
          </div>
        </div>
        <div className="relative">
          <Input
            placeholder="Search for answers..."
            className="pr-24 bg-card/50 border-border/50 focus:border-primary/50"
          />
          <Button size="sm" className="absolute right-1 top-1 bg-primary hover:bg-primary/90">
            Search
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {resources.map((resource) => (
          <a
            key={resource.title}
            href={resource.href}
            className="glass-card rounded-xl border border-border/50 p-5 hover:border-primary/30 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <resource.icon className="size-5" />
              </div>
              <ExternalLink className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="mt-4 font-semibold">{resource.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{resource.description}</p>
          </a>
        ))}
      </div>

      <div className="glass-card rounded-xl border border-border/50 p-6">
        <h2 className="font-semibold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-border/30 pb-4 last:border-0 last:pb-0">
              <h3 className="font-medium text-sm mb-2">{faq.question}</h3>
              <p className="text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-xl border border-border/50 p-6 text-center">
        <h2 className="font-semibold mb-2">Still need help?</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {"Our support team is available 24/7 to assist you."}
        </p>
        <Button className="bg-primary hover:bg-primary/90">Contact Support</Button>
      </div>
    </div>
  )
}
