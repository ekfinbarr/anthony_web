import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Question {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  questions: Question[];
}

const FaqAccordion = ({ questions }: FaqAccordionProps) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      {questions.map((q, index) => (
        <AccordionItem key={index} value={`item-${index}`} className="border-b border-border">
          <AccordionTrigger className="text-left hover:no-underline hover:text-primary px-6 py-4">
            <span className="font-medium text-foreground">{q.question}</span>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-4 text-muted-foreground">
            {q.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default FaqAccordion;
