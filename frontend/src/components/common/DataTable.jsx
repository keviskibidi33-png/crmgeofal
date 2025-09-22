import React, { useState, useMemo } from 'react';
import { Table, Form, InputGroup, Button, Badge, Dropdown, Pagination, Row, Col } from 'react-bootstrap';
import { FiSearch, FiFilter, FiMoreVertical, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';

const DataTable = ({
  data = [],
  columns = [],
  searchable = true,
  filterable = true,
  actions = [],
  onEdit,
  onDelete,
  onView,
  loading = false,
  emptyMessage = "No hay datos disponibles",
  className = "",
  // Nuevas props para paginación del backend
  totalItems = 0,
  itemsPerPage = 20,
  currentPage = 1,
  onPageChange,
  onSearch,
  onFilter,
  // Props para filtros personalizados
  filterOptions = null
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  // Filtrar y ordenar datos
  const filteredData = useMemo(() => {
    let filtered = data;

    // Si hay paginación del backend, no filtrar localmente
    if (totalItems > 0) {
      return filtered;
    }

    // Búsqueda local (solo si no hay paginación del backend)
    if (searchTerm && searchable) {
      filtered = filtered.filter(item =>
        columns.some(col => {
          const value = col.accessor ? item[col.accessor] : '';
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Ordenamiento
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortField, sortDirection, columns, searchable, totalItems]);

  // Paginación - usar props del backend si están disponibles
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / itemsPerPage) : Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = totalItems > 0 ? data : filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const renderCell = (item, column) => {
    const value = column.accessor ? item[column.accessor] : '';
    
    if (column.render) {
      return column.render(value, item);
    }
    
    if (column.type === 'badge') {
      return (
        <Badge bg={column.badgeColor || 'secondary'}>
          {value}
        </Badge>
      );
    }
    
    if (column.type === 'date') {
      return new Date(value).toLocaleDateString('es-ES');
    }
    
    return value;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2 text-muted">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className={`data-table ${className}`}>
      {/* Barra de búsqueda y filtros */}
      {(searchable || filterable) && (
        <div className="table-controls bg-light p-3 rounded-top border">
          <Row className="align-items-center">
            {searchable && (
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text>
                    <FiSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Buscar por nombre, email, rol..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      // Si hay función onSearch del backend, llamarla con debounce
                      if (onSearch) {
                        clearTimeout(window.searchTimeout);
                        window.searchTimeout = setTimeout(() => {
                          onSearch(e.target.value);
                        }, 500); // Debounce de 500ms
                      }
                    }}
                  />
                </InputGroup>
              </Col>
            )}
            
            {filterable && (
              <Col md={6} className="text-end">
                <Dropdown>
                  <Dropdown.Toggle variant="outline-secondary" size="sm">
                  <FiFilter className="me-1" />
                  Filtros
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item 
                      onClick={() => onFilter && onFilter({})}
                    >
                      Limpiar filtros
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    
                    {/* Filtros dinámicos basados en filterOptions */}
                    {filterOptions ? (
                      filterOptions.map((section, index) => (
                        <React.Fragment key={index}>
                          <Dropdown.Header>{section.title}</Dropdown.Header>
                          {section.options.map((option, optIndex) => (
                            <Dropdown.Item 
                              key={optIndex}
                              onClick={() => onFilter && onFilter(option.filter)}
                            >
                              {option.label}
                            </Dropdown.Item>
                          ))}
                          {index < filterOptions.length - 1 && <Dropdown.Divider />}
                        </React.Fragment>
                      ))
                    ) : (
                      // Filtros por defecto para usuarios
                      <>
                        <Dropdown.Header>Por Rol</Dropdown.Header>
                        <Dropdown.Item onClick={() => onFilter && onFilter({ role: 'admin' })}>
                          Administradores
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => onFilter && onFilter({ role: 'vendedor_comercial' })}>
                          Vendedores Comerciales
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => onFilter && onFilter({ role: 'jefa_comercial' })}>
                          Jefas Comerciales
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => onFilter && onFilter({ role: 'jefe_laboratorio' })}>
                          Jefes de Laboratorio
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => onFilter && onFilter({ role: 'usuario_laboratorio' })}>
                          Usuarios de Laboratorio
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => onFilter && onFilter({ role: 'soporte' })}>
                          Soporte
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => onFilter && onFilter({ role: 'gerencia' })}>
                          Gerencia
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Header>Por Área</Dropdown.Header>
                        <Dropdown.Item onClick={() => onFilter && onFilter({ area: 'Comercial' })}>
                          Comercial
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => onFilter && onFilter({ area: 'Laboratorio' })}>
                          Laboratorio
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => onFilter && onFilter({ area: 'Sistemas' })}>
                          Sistemas
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => onFilter && onFilter({ area: 'Gerencia' })}>
                          Gerencia
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => onFilter && onFilter({ area: 'Soporte' })}>
                          Soporte
                        </Dropdown.Item>
                      </>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
            )}
          </Row>
        </div>
      )}

      {/* Tabla */}
      <div className="table-responsive">
        <Table hover className="mb-0">
          <thead className="table-light">
            <tr>
              {columns.map((column, index) => (
                <th 
                  key={index}
                  className={column.sortable ? 'cursor-pointer' : ''}
                  onClick={() => column.sortable && handleSort(column.accessor)}
                  style={{ minWidth: column.width || 'auto' }}
                >
                  <div className="d-flex align-items-center">
                    {column.header}
                    {column.sortable && (
                      <span className="ms-1 text-muted">
                        {getSortIcon(column.accessor)}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              
              {actions.length > 0 && (
                <th width="120" className="text-center">Acciones</th>
              )}
            </tr>
          </thead>
          
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="text-center py-5">
                  <div className="text-muted">
                    <FiSearch size={48} className="mb-3 opacity-50" />
                    <p className="mb-0">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <tr key={item.id || index}>
                  {columns.map((column, colIndex) => (
                    <td key={colIndex}>
                      {renderCell(item, column)}
                    </td>
                  ))}
                  
                  {actions.length > 0 && (
                    <td className="text-center">
                      <Dropdown>
                        <Dropdown.Toggle variant="link" size="sm" className="text-muted">
                          <FiMoreVertical />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          {actions.length > 0 ? (
                            actions.map((action, actionIndex) => (
                              <Dropdown.Item 
                                key={actionIndex}
                                onClick={() => action.onClick && action.onClick(item)}
                                className={action.variant === 'outline-danger' ? 'text-danger' : ''}
                              >
                                {action.icon && <action.icon className="me-2" />}
                                {action.label}
                              </Dropdown.Item>
                            ))
                          ) : (
                            <>
                              {onView && (
                                <Dropdown.Item onClick={() => onView(item)}>
                                  <FiEye className="me-2" />
                                  Ver
                                </Dropdown.Item>
                              )}
                              {onEdit && (
                                <Dropdown.Item onClick={() => onEdit(item)}>
                                  <FiEdit className="me-2" />
                                  Editar
                                </Dropdown.Item>
                              )}
                              {onDelete && (
                                <Dropdown.Item 
                                  onClick={() => onDelete(item)}
                                  className="text-danger"
                                >
                                  <FiTrash2 className="me-2" />
                                  Eliminar
                                </Dropdown.Item>
                              )}
                            </>
                          )}
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="table-footer bg-light p-3 rounded-bottom border border-top-0">
          <Row className="align-items-center">
            <Col>
              <small className="text-muted">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalItems || filteredData.length)} de {totalItems || filteredData.length} registros
              </small>
            </Col>
            <Col xs="auto">
              <div className="d-flex align-items-center gap-2">
                {/* Botón Primera página */}
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => onPageChange ? onPageChange(1) : setCurrentPage(1)}
                  title="Primera página"
                >
                  ««
                </Button>
                
                {/* Botón Anterior */}
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => onPageChange ? onPageChange(currentPage - 1) : setCurrentPage(currentPage - 1)}
                  title="Página anterior"
                >
                  «
                </Button>
                
                {/* Páginas dinámicas (máximo 3 visibles) */}
                {(() => {
                  const pages = [];
                  const startPage = Math.max(1, currentPage - 1);
                  const endPage = Math.min(totalPages, startPage + 2);
                  
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <Button
                        key={i}
                        variant={currentPage === i ? "primary" : "outline-secondary"}
                        size="sm"
                        onClick={() => onPageChange ? onPageChange(i) : setCurrentPage(i)}
                        className="px-3"
                      >
                        {i}
                      </Button>
                    );
                  }
                  return pages;
                })()}
                
                {/* Botón Siguiente */}
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => onPageChange ? onPageChange(currentPage + 1) : setCurrentPage(currentPage + 1)}
                  title="Página siguiente"
                >
                  »
                </Button>
                
                {/* Botón Última página */}
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => onPageChange ? onPageChange(totalPages) : setCurrentPage(totalPages)}
                  title="Última página"
                >
                  »»
                </Button>
                
                {/* Input para ir a página específica */}
                <div className="d-flex align-items-center gap-1 ms-3">
                  <span className="text-muted small">Ir a:</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    className="form-control form-control-sm"
                    style={{ width: '60px' }}
                    placeholder="..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const page = parseInt(e.target.value);
                        if (page >= 1 && page <= totalPages) {
                          onPageChange ? onPageChange(page) : setCurrentPage(page);
                          e.target.value = '';
                        } else {
                          // Si la página no existe, ir a la última página
                          onPageChange ? onPageChange(totalPages) : setCurrentPage(totalPages);
                          e.target.value = '';
                        }
                      }
                    }}
                    title={`Ingresa un número del 1 al ${totalPages}`}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};

export default DataTable;
