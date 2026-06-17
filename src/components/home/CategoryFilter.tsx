interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const categories = [
  { id: "all", label: "All Incidents" },
  { id: "road", label: "Road & Traffic" },
  { id: "power", label: "Power & Outages" },
  { id: "safety", label: "Public Safety" },
  { id: "food", label: "Food & Aid" },
  { id: "memory", label: "Memory" },
  { id: "recommendation", label: "Recommendations" },
];

const CategoryFilter = ({ selectedCategory, onSelectCategory }: CategoryFilterProps) => {
  return (
    <div className="w-full mb-6">
      <div className="flex items-center space-x-2 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-darkBorder scrollbar-track-transparent">
        {categories.map((category) => {
          const isActive = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold tracking-wide border transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-brandPrimary text-white border-brandPrimary shadow-lg shadow-brandPrimary/30"
                  : "bg-darkCard text-darkTextSecondary border-2 border-darkBorder hover:bg-brandPrimary/10 hover:text-darkText"
              }`}
            >
              {category.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
