import React from 'react';
import { useQuery } from 'react-query';
import { Alert } from 'react-bootstrap';
import { 
  FiSettings, FiPackage
} from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import { listServices } from '../services/services';

export default function Servicios() {
  const { data, isLoading } = useQuery(
    ['services'],
    () => listServices(),
    { keepPreviousData: true }
  );



  return (
    <div className="fade-in">
      <PageHeader
        title="Servicios"
        subtitle="Módulos fijos: Laboratorio e Ingeniería"
        icon={FiSettings}
      />
      
      <Alert variant="info" className="mb-4">
        <FiSettings className="me-2" />
        Los servicios están limitados a dos módulos fijos: <strong>Laboratorio</strong> e <strong>Ingeniería</strong>.
        No se pueden crear proyectos adicionales.
      </Alert>

      {/* Módulos Fijos */}
      <div className="row mb-4">
        {/* Módulo Laboratorio */}
        <div className="col-md-6 mb-4">
          <div className="card h-100 border-primary">
            <div className="card-header bg-primary text-white d-flex align-items-center">
              <FiSettings className="me-2" />
              <h5 className="mb-0 text-dark">Laboratorio</h5>
            </div>
            <div className="card-body">
              <p className="text-muted mb-3">
                Servicios especializados en análisis, pruebas y ensayos de laboratorio 
                para diversos materiales y muestras.
              </p>
              <div className="mb-3">
                <h6 className="text-primary">Servicios Principales:</h6>
                <ul className="list-unstyled">
                  <li>• Análisis de Suelos</li>
                  <li>• Ensayos de Materiales</li>
                  <li>• Pruebas de Calidad</li>
                  <li>• Análisis Químicos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Módulo Ingeniería */}
        <div className="col-md-6 mb-4">
          <div className="card h-100 border-success">
            <div className="card-header bg-success text-white d-flex align-items-center">
              <FiPackage className="me-2" />
              <h5 className="mb-0 text-dark">Ingeniería</h5>
            </div>
            <div className="card-body">
              <p className="text-muted mb-3">
                Servicios de consultoría, diseño y desarrollo de proyectos 
                de ingeniería especializada.
              </p>
              <div className="mb-3">
                <h6 className="text-success">Servicios Principales:</h6>
                <ul className="list-unstyled">
                  <li>• Diseño Estructural</li>
                  <li>• Consultoría Técnica</li>
                  <li>• Proyectos de Ingeniería</li>
                  <li>• Evaluaciones Técnicas</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>


        </div>
  );
}