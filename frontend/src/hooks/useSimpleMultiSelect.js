import { useState, useCallback } from 'react';

/**
 * Hook simple para selección múltiple sin complicaciones
 * @param {Array} items - Array de elementos a seleccionar
 * @param {Function} getItemId - Función para obtener el ID de un elemento
 * @returns {Object} - Estado y funciones de selección
 */
export const useSimpleMultiSelect = (items = [], getItemId = (item) => item.id) => {
  const [selectedItems, setSelectedItems] = useState(new Set());

  // Obtener IDs de elementos seleccionados
  const selectedIds = Array.from(selectedItems);

  // Verificar si un elemento está seleccionado
  const isSelected = useCallback((item) => {
    const id = getItemId(item);
    return selectedItems.has(id);
  }, [selectedItems, getItemId]);

  // Verificar si todos los elementos están seleccionados
  const isAllSelected = selectedItems.size === items.length && items.length > 0;

  // Verificar si algunos elementos están seleccionados
  const isPartiallySelected = selectedItems.size > 0 && selectedItems.size < items.length;

  // Toggle selección de un elemento
  const toggleItem = useCallback((item) => {
    const id = getItemId(item);
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, [getItemId]);

  // Seleccionar todos los elementos
  const selectAll = useCallback(() => {
    const allIds = items.map(item => getItemId(item));
    setSelectedItems(new Set(allIds));
  }, [items, getItemId]);

  // Deseleccionar todos los elementos
  const deselectAll = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  // Toggle selección de todos los elementos
  const toggleAll = useCallback(() => {
    if (isAllSelected) {
      deselectAll();
    } else {
      selectAll();
    }
  }, [isAllSelected, selectAll, deselectAll]);

  // Limpiar selección
  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  // Obtener elementos seleccionados
  const getSelectedItems = useCallback(() => {
    return items.filter(item => isSelected(item));
  }, [items, isSelected]);

  return {
    // Estado
    selectedItems,
    selectedIds,
    isAllSelected,
    isPartiallySelected,
    
    // Funciones de selección
    isSelected,
    toggleItem,
    selectAll,
    deselectAll,
    toggleAll,
    clearSelection,
    getSelectedItems,
  };
};

export default useSimpleMultiSelect;
