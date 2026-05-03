'use client';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

const FAQS = [
    {
        q: "How does the AI determine my roadmap?",
        a: "Our Nova Engine analyzes your current skill set, career goals, and market trends to calculate a high-probability path to achievement."
    },
    {
        q: "Is ThinkAI for beginners or advanced devs?",
        a: "Both. The platform adapts its difficulty and content based on your starting baseline, ensuring everyone from interns to senior architects find value."
    },
    {
        q: "How are the certificates verified?",
        a: "Every certificate is anchored to a unique hash on our private blockchain, verifiable by any employer instantly."
    },
    {
        q: "Can I use the IDE assessments for practice?",
        a: "Yes, our playground and lab environments are available for unlimited practice as part of your membership."
    }
];

export function FAQ() {
    return (
        <section className="py-40 bg-background">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">Frequently Asked Questions</h2>
                        <p className="text-muted-foreground/70">Everything you need to know about the Nova platform.</p>
                    </div>

                    <Accordion type="single" collapsible className="space-y-4">
                        {FAQS.map((faq, i) => (
                            <AccordionItem key={i} value={`item-${i}`} className="border border-white/5 bg-white/5 rounded-3xl px-8 overflow-hidden">
                                <AccordionTrigger className="text-xl font-bold py-8 hover:no-underline hover:text-primary transition-all">
                                    {faq.q}
                                </AccordionTrigger>
                                <AccordionContent className="text-lg text-muted-foreground/80 leading-relaxed pb-8">
                                    {faq.a}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    );
}
