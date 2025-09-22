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
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Filtrar y ordenar datos
  const filteredData = useMemo(() => {
    let filtered = data;

    // Búsqueda
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
  }, [data, searchTerm, sortField, sortDirection, columns, searchable]);

  // Paginación
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

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
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
            )}
            
            {filterable && (
              <Col md={6} className="text-end">
                <Button variant="outline-secondary" size="sm">
                  <FiFilter className="me-1" />
                  Filtros
                </Button>
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
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredData.length)} de {filteredData.length} registros
              </small>
            </Col>
            <Col xs="auto">
              <Pagination size="sm" className="mb-0">
                <Pagination.Prev 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                />
                
                {[...Array(totalPages)].map((_, index) => (
                  <Pagination.Item
                    key={index + 1}
                    active={currentPage === index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </Pagination.Item>
                ))}
                
                <Pagination.Next 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                />
              </Pagination>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};

export default DataTable;
