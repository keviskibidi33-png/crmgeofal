import { useState, useCallback, useRef } from 'react';

/**
 * Hook personalizado para manejar selección múltiple estilo Excel
 * @param {Array} items - Array de elementos a seleccionar
 * @param {Function} getItemId - Función para obtener el ID de un elemento
 * @returns {Object} - Estado y funciones de selección
 */
export const useMultiSelect = (items = [], getItemId = (item) => item.id) => {
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const selectionRef = useRef(null);

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

  // Seleccionar un elemento individual
  const selectItem = useCallback((item) => {
    const id = getItemId(item);
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  }, [getItemId]);

  // Deseleccionar un elemento individual
  const deselectItem = useCallback((item) => {
    const id = getItemId(item);
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, [getItemId]);

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

  // Iniciar selección por rango
  const startRangeSelection = useCallback((startIndex) => {
    setIsSelecting(true);
    setSelectionStart(startIndex);
    setSelectionEnd(startIndex);
  }, []);

  // Actualizar rango de selección
  const updateRangeSelection = useCallback((endIndex) => {
    if (isSelecting) {
      setSelectionEnd(endIndex);
      
      const start = Math.min(selectionStart, endIndex);
      const end = Math.max(selectionStart, endIndex);
      
      const newSelected = new Set(selectedItems);
      for (let i = start; i <= end; i++) {
        if (items[i]) {
          newSelected.add(getItemId(items[i]));
        }
      }
      setSelectedItems(newSelected);
    }
  }, [isSelecting, selectionStart, selectedItems, items, getItemId]);

  // Finalizar selección por rango
  const endRangeSelection = useCallback(() => {
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  }, []);

  // Manejar clic en elemento
  const handleItemClick = useCallback((item, index, event) => {
    if (event.button === 0) { // Solo botón izquierdo
      event.preventDefault();
      
      if (event.ctrlKey || event.metaKey) {
        // Selección múltiple con Ctrl/Cmd
        toggleItem(item);
      } else if (event.shiftKey && selectionStart !== null) {
        // Selección por rango con Shift
        const start = Math.min(selectionStart, index);
        const end = Math.max(selectionStart, index);
        
        const newSelected = new Set(selectedItems);
        for (let i = start; i <= end; i++) {
          if (items[i]) {
            newSelected.add(getItemId(items[i]));
          }
        }
        setSelectedItems(newSelected);
      } else {
        // Selección individual
        if (isSelected(item)) {
          deselectItem(item);
        } else {
          selectItem(item);
        }
        setSelectionStart(index);
      }
    }
  }, [toggleItem, isSelected, deselectItem, selectItem, selectionStart, selectedItems, items, getItemId]);

  // Manejar mouse down para arrastrar
  const handleMouseDown = useCallback((item, index, event) => {
    if (event.button === 0) {
      event.preventDefault();
      startRangeSelection(index);
      toggleItem(item);
    }
  }, [startRangeSelection, toggleItem]);

  // Manejar mouse enter durante arrastre
  const handleMouseEnter = useCallback((item, index, event) => {
    if (isSelecting) {
      updateRangeSelection(index);
    }
  }, [isSelecting, updateRangeSelection]);

  // Manejar mouse up
  const handleMouseUp = useCallback(() => {
    endRangeSelection();
  }, [endRangeSelection]);

  // Obtener elementos seleccionados
  const getSelectedItems = useCallback(() => {
    return items.filter(item => isSelected(item));
  }, [items, isSelected]);

  // Limpiar selección
  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  }, []);

  return {
    // Estado
    selectedItems,
    selectedIds,
    isSelecting,
    selectionStart,
    selectionEnd,
    isAllSelected,
    isPartiallySelected,
    
    // Funciones de selección
    isSelected,
    selectItem,
    deselectItem,
    toggleItem,
    selectAll,
    deselectAll,
    toggleAll,
    
    // Funciones de rango
    startRangeSelection,
    updateRangeSelection,
    endRangeSelection,
    
    // Handlers
    handleItemClick,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    
    // Utilidades
    getSelectedItems,
    clearSelection,
    
    // Referencias
    selectionRef
  };
};

export default useMultiSelect;
