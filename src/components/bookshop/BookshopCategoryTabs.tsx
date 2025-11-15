import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface BookshopCategoryTabsProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export default function BookshopCategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
}: BookshopCategoryTabsProps) {
  return (
    <div className="w-full">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-2 p-4">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? 'default' : 'outline'}
              className={`flex-shrink-0 px-4 py-2 h-auto ${
                activeCategory === category.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'hover:bg-primary/10'
              }`}
              onClick={() => onCategoryChange(category.id)}
            >
              <span className="text-lg mr-2">{category.icon}</span>
              <span className="font-medium">{category.name}</span>
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}