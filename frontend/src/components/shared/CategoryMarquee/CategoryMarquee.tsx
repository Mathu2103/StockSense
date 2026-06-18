import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { MasterDataService } from '../../../services/masterDataService';

const scrollCategories = [
  { icon: '🥤', name: 'Beverages' },
  { icon: '🍿', name: 'Snacks' },
  { icon: '🥛', name: 'Dairy Products' },
  { icon: '🥐', name: 'Bakery Items' },
  { icon: '🥗', name: 'Fruits & Vegetables' },
  { icon: '🧊', name: 'Frozen Foods' },
  { icon: '🏡', name: 'Household Essentials' },
  { icon: '🧴', name: 'Personal Care' },
  { icon: '🥫', name: 'Packaged Foods' },
  { icon: '🧽', name: 'Cleaning Supplies' }
];

const getCategoryIcon = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('beverage')) return '🥤';
  if (lower.includes('snack')) return '🍿';
  if (lower.includes('dairy')) return '🥛';
  if (lower.includes('bakery') || lower.includes('bread')) return '🥐';
  if (lower.includes('fruit') || lower.includes('veg') || lower.includes('produce')) return '🥗';
  if (lower.includes('frozen')) return '🧊';
  if (lower.includes('household') || lower.includes('home')) return '🏡';
  if (lower.includes('personal') || lower.includes('care') || lower.includes('beauty')) return '🧴';
  if (lower.includes('packaged') || lower.includes('food') || lower.includes('canned')) return '🥫';
  if (lower.includes('clean') || lower.includes('wash')) return '🧽';
  if (lower.includes('meat') || lower.includes('seafood') || lower.includes('fish')) return '🥩';
  if (lower.includes('electronics')) return '🔌';
  if (lower.includes('wearable')) return '⌚';
  if (lower.includes('accessory')) return '👜';
  return '📦';
};

interface CategoryMarqueeProps {
  onCategorySelect?: (categoryName: string) => void;
  activeCategory?: string;
}

export default function CategoryMarquee({ onCategorySelect, activeCategory }: CategoryMarqueeProps) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<{ icon: string; name: string }[]>(scrollCategories);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await MasterDataService.getCategories();
        if (res.success) {
          const activeCategories = res.data.filter((c: any) => c.isActive !== false);
          const mapped = activeCategories.map((c: any) => ({
            icon: getCategoryIcon(c.name),
            name: c.name
          }));
          if (mapped.length > 0) {
            setCategories(mapped);
          }
        }
      } catch (err) {
        console.error('Failed to fetch categories for marquee:', err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="relative w-full overflow-hidden fade-edges">
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-infinite-scroll {
          animation: scroll 30s linear infinite;
          width: max-content;
        }
        .animate-infinite-scroll:hover {
          animation-play-state: paused;
        }
        .fade-edges {
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
        }
      `}</style>
      <div className="animate-infinite-scroll flex gap-2.5 py-2">
        {[...categories, ...categories].map((cat, idx) => {
          const isSelected = activeCategory === cat.name;
          return (
            <div 
              key={idx} 
              onClick={() => {
                if (onCategorySelect) {
                  onCategorySelect(cat.name);
                } else {
                  const categorySlug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                  navigate(`/category/${categorySlug}`);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors rounded-[8px] text-[13px] font-medium whitespace-nowrap cursor-pointer border shadow-sm ${
                isSelected 
                  ? 'bg-[#166534] text-white border-[#166534]' 
                  : 'bg-[#f4f5f7] hover:bg-[#e2e8f0] text-gray-700 border-gray-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span className={isSelected ? 'text-white font-semibold' : 'text-gray-600'}>{cat.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
