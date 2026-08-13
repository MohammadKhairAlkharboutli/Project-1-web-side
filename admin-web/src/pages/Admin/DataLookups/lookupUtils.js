export const LOOKUP_CATEGORIES = [
  { value: "BLOOD_TYPE", label: "Blood type" },
  { value: "LIFESTYLE_HABITS", label: "Lifestyle habit" },
  { value: "CHRONIC_CONDITIONS", label: "Chronic conditions" },
  { value: "CHRONIC_CONDITION_CATEGORY", label: "Chronic condition category" },
  { value: "CHRONIC_CONDITION", label: "Chronic condition" },
  { value: "DISABILITY_TYPES", label: "Disability type" },
  { value: "ALLERGY", label: "Allergy" },
  { value: "COMMON_SURGERIES", label: "Common surgery" },
  { value: "MEDICAL_SPECIALTY", label: "Medical specialty" },
  { value: "MEDICAL_SUB_SPECIALTY", label: "Medical sub-specialty" },
];

const CATEGORY_LABELS = LOOKUP_CATEGORIES.reduce((labels, category) => {
  labels[category.value] = category.label;
  return labels;
}, {});

const PARENT_CATEGORY_BY_CATEGORY = {
  MEDICAL_SUB_SPECIALTY: "MEDICAL_SPECIALTY",
  CHRONIC_CONDITION: "CHRONIC_CONDITION_CATEGORY",
};

export function getLookupCategoryLabel(category) {
  return CATEGORY_LABELS[category] || category;
}

export function getParentCategoryForCategory(category) {
  return PARENT_CATEGORY_BY_CATEGORY[category] || null;
}

export function getLookupDisplayName(lookup) {
  if (!lookup) {
    return "No parent";
  }

  return lookup.labelEn || lookup.value || `Lookup #${lookup.id}`;
}

export function getLookupParent(lookup, lookups) {
  if (!lookup?.parentId) {
    return null;
  }

  return lookups.find((item) => String(item.id) === String(lookup.parentId)) || null;
}

export function getEligibleParentLookups(category, lookups, currentLookupId, currentParentId) {
  const parentCategory = getParentCategoryForCategory(category);

  if (!parentCategory) {
    return [];
  }

  return lookups.filter(
    (lookup) =>
      lookup.category === parentCategory &&
      String(lookup.id) !== String(currentLookupId) &&
      (lookup.isActive || String(lookup.id) === String(currentParentId)),
  );
}

export function formatLookupDate(dateValue) {
  if (!dateValue) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateValue));
}
