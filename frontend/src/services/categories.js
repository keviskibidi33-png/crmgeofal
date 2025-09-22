import apiFetch from './api';

// Servicios para categorías de proyectos
export const listCategories = () => {
  return apiFetch('/api/project-categories');
};

export const getCategoryById = (id) => {
  return apiFetch(`/api/project-categories/${id}`);
};

export const createCategory = (data) => {
  return apiFetch('/api/project-categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateCategory = (id, data) => {
  return apiFetch(`/api/project-categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteCategory = (id) => {
  return apiFetch(`/api/project-categories/${id}`, {
    method: 'DELETE',
  });
};

// Servicios para subcategorías
export const listSubcategories = (categoryId = null) => {
  const url = categoryId 
    ? `/api/project-subcategories?category_id=${categoryId}`
    : '/api/project-subcategories';
  return apiFetch(url);
};

export const getSubcategoryById = (id) => {
  return apiFetch(`/api/project-subcategories/${id}`);
};

export const createSubcategory = (data) => {
  return apiFetch('/api/project-subcategories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateSubcategory = (id, data) => {
  return apiFetch(`/api/project-subcategories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteSubcategory = (id) => {
  return apiFetch(`/api/project-subcategories/${id}`, {
    method: 'DELETE',
  });
};