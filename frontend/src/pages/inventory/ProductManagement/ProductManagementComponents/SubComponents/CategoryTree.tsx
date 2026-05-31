import React, { useState } from 'react';

type SubCategoryNode = {
  id: string;
  name: string;
  productsCount?: number;
};

type CategoryNode = {
  id: string;
  name: string;
  icon: string;
  children: SubCategoryNode[];
};

type CategoryTreeProps = {
  categories: CategoryNode[];
  onSelectSubcategory?: (parentName: string, subName: string) => void;
};

export default function CategoryTree({ categories, onSelectSubcategory }: CategoryTreeProps) {
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({
    dairy: true,
    food: true,
    beverages: true,
  });

  const toggleParent = (id: string) => {
    setExpandedParents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm space-y-4">
      <div>
        <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5">
          <span className="material-symbols-outlined text-primary text-[20px]">account_tree</span>
          Hierarchy Trees
        </h3>
        <p className="text-[11px] text-outline mt-0.5">Explore active supermarket shelves.</p>
      </div>

      <div className="space-y-2">
        {categories.map((parent) => {
          const isExpanded = !!expandedParents[parent.id];
          return (
            <div key={parent.id} className="border border-slate-100 rounded-lg overflow-hidden">
              {/* Parent Toggle Item */}
              <button
                type="button"
                onClick={() => toggleParent(parent.id)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg leading-none">{parent.icon}</span>
                  <span className="text-xs font-bold text-on-surface">{parent.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-slate-200/60 text-on-surface-variant text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {parent.children.length} Sub
                  </span>
                  <span className={`material-symbols-outlined text-outline-variant text-[18px] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </div>
              </button>

              {/* Children List */}
              {isExpanded && (
                <div className="px-3 py-2 bg-white space-y-1 pl-6 border-l-2 border-primary/20 ml-4 my-1">
                  {parent.children.length === 0 ? (
                    <p className="text-[11px] text-outline italic py-1">No subcategories defined.</p>
                  ) : (
                    parent.children.map((child) => (
                      <div
                        key={child.id}
                        onClick={() => onSelectSubcategory?.(parent.name, child.name)}
                        className="group flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-primary/5 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-outline-variant group-hover:bg-primary transition-colors"></span>
                          <span className="text-[11px] font-bold text-on-surface-variant group-hover:text-primary transition-colors">
                            {child.name}
                          </span>
                        </div>
                        {onSelectSubcategory && (
                          <span className="material-symbols-outlined text-outline-variant group-hover:text-primary text-[14px] opacity-0 group-hover:opacity-100 transition-all">
                            arrow_forward
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
